import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

// Derive 32-byte key for AES-256 from config key
function getEncryptionKey() {
  const rawKey = config.encryptionKey || 'emobility_default_encryption_key_32_bytes!';
  return crypto.createHash('sha256').update(String(rawKey)).digest();
}

/**
 * Encrypt plain text (such as email) using AES-256-GCM.
 * Output format: iv_hex:auth_tag_hex:encrypted_hex
 */
export function encryptEmail(plainEmail) {
  if (!plainEmail || typeof plainEmail !== 'string') return plainEmail;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // Standard 12-byte IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainEmail.trim(), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM encrypted string.
 * Gracefully handles legacy unencrypted strings.
 */
export function decryptEmail(encryptedEmail) {
  if (!encryptedEmail || typeof encryptedEmail !== 'string') return encryptedEmail;

  const parts = encryptedEmail.split(':');
  if (parts.length !== 3) {
    // Legacy unencrypted email string
    return encryptedEmail;
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  if (ivHex.length !== 24 || authTagHex.length !== 32) {
    // Not standard AES-GCM hex lengths, treat as unencrypted
    return encryptedEmail;
  }

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // In case decryption fails or format was accidental
    return encryptedEmail;
  }
}

/**
 * Deterministic hash of lowercase email using HMAC-SHA256.
 * Used for querying users without storing plain emails.
 */
export function hashEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const cleanEmail = email.trim().toLowerCase();
  const secret = config.emailHashKey || 'emobility_default_email_hash_key_secret!';
  return crypto.createHmac('sha256', secret).update(cleanEmail).digest('hex');
}

/**
 * Hash password with bcrypt (salt rounds >= 10).
 */
export function hashPassword(plainPassword, saltRounds = 10) {
  return bcrypt.hashSync(plainPassword, saltRounds);
}

/**
 * Verify password against bcrypt hash securely.
 */
export function verifyPassword(plainPassword, storedHash) {
  if (!plainPassword || !storedHash) return false;
  try {
    return bcrypt.compareSync(plainPassword, storedHash);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure temporary password:
 * Min 12 chars (default 14), containing uppercase, lowercase, digits, and symbols.
 * Uses Node.js crypto.randomInt (CSPRNG).
 */
export function generateSecureTemporaryPassword(length = 14) {
  const minLength = Math.max(12, length);
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude easily confused I, O
  const lower = 'abcdefghjkmnpqrstuvwxyz'; // exclude easily confused l, o
  const numbers = '23456789'; // exclude 0, 1
  const symbols = '!@#$%^&*()_+-=~';
  const allChars = upper + lower + numbers + symbols;

  // Guarantee at least one character from each set
  const passwordChars = [
    upper[crypto.randomInt(0, upper.length)],
    lower[crypto.randomInt(0, lower.length)],
    numbers[crypto.randomInt(0, numbers.length)],
    symbols[crypto.randomInt(0, symbols.length)],
  ];

  // Fill remaining characters from entire character pool
  for (let i = passwordChars.length; i < minLength; i++) {
    passwordChars.push(allChars[crypto.randomInt(0, allChars.length)]);
  }

  // Shuffle using Fisher-Yates with crypto.randomInt
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join('');
}
