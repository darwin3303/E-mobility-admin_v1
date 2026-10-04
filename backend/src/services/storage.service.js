import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base private storage root outside public access
const STORAGE_ROOT = path.join(__dirname, '../../data/secure_photos');
const LOGIN_AUDITS_DIR = path.join(STORAGE_ROOT, 'login_audits');
const PROFILES_DIR = path.join(STORAGE_ROOT, 'profiles');

// Ensure private directories exist with secure permissions
function ensureDirectories() {
  if (!fs.existsSync(STORAGE_ROOT)) {
    fs.mkdirSync(STORAGE_ROOT, { recursive: true });
  }
  if (!fs.existsSync(LOGIN_AUDITS_DIR)) {
    fs.mkdirSync(LOGIN_AUDITS_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROFILES_DIR)) {
    fs.mkdirSync(PROFILES_DIR, { recursive: true });
  }
}

ensureDirectories();

// Retention Policy: 14 Days in milliseconds
export const PHOTO_RETENTION_MS = 14 * 24 * 60 * 60 * 1000;

export const storageService = {
  /**
   * Save a base64 image securely to private disk
   * @param {string} base64Data 
   * @param {'login_audits' | 'profiles'} category 
   * @returns {string} filename
   */
  saveSecurePhoto(base64Data, category = 'login_audits') {
    ensureDirectories();
    const targetDir = category === 'profiles' ? PROFILES_DIR : LOGIN_AUDITS_DIR;

    // Strip data URL header if present
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Generate cryptographic unguessable filename
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(16).toString('hex');
    const filename = `${category}_${timestamp}_${randomHash}.webp`;
    const filePath = path.join(targetDir, filename);

    fs.writeFileSync(filePath, buffer);
    return filename;
  },

  /**
   * Retrieve a secure photo if within retention period
   * @param {string} filename 
   * @param {'login_audits' | 'profiles'} category 
   * @returns {{ buffer: Buffer, mimeType: string, isExpired: boolean } | null}
   */
  getSecurePhoto(filename, category = 'login_audits') {
    if (!filename || filename.startsWith('[PURGED')) return null;

    const targetDir = category === 'profiles' ? PROFILES_DIR : LOGIN_AUDITS_DIR;
    const filePath = path.join(targetDir, filename);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    // Check retention policy for login audits
    if (category === 'login_audits') {
      const stats = fs.statSync(filePath);
      const ageMs = Date.now() - stats.mtimeMs;
      if (ageMs > PHOTO_RETENTION_MS) {
        // Enforce automatic deletion immediately
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore
        }
        return { isExpired: true };
      }
    }

    const buffer = fs.readFileSync(filePath);
    return {
      buffer,
      mimeType: 'image/webp',
      isExpired: false
    };
  },

  /**
   * 14-Day Automatic Photo-Retention Enforcer
   * Deletes all login verification photos older than 14 days
   */
  purgeExpiredPhotos() {
    ensureDirectories();
    console.log('🧹 [RETENTION] Running 14-day automatic photo purge check...');
    let purgedCount = 0;

    try {
      const files = fs.readdirSync(LOGIN_AUDITS_DIR);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(LOGIN_AUDITS_DIR, file);
        try {
          const stats = fs.statSync(filePath);
          const ageMs = now - stats.mtimeMs;

          if (ageMs > PHOTO_RETENTION_MS) {
            fs.unlinkSync(filePath);
            purgedCount++;
          }
        } catch (err) {
          console.warn(`[RETENTION] Error inspecting file ${file}:`, err.message);
        }
      }

      console.log(`✅ [RETENTION] Purge check completed. Removed ${purgedCount} expired verification photo(s).`);
    } catch (err) {
      console.error('❌ [RETENTION] Error during photo retention purge:', err.message);
    }

    return purgedCount;
  }
};

// Run retention check on boot and every 6 hours
setTimeout(() => storageService.purgeExpiredPhotos(), 5000);
setInterval(() => storageService.purgeExpiredPhotos(), 6 * 60 * 60 * 1000);
