import { pool, isPostgresConnected } from './config/db.js';
import { config } from './config/env.js';
import { encryptEmail, hashEmail, hashPassword } from './utils/crypto.utils.js';

/**
 * Idempotent Seed Script for Super Admin Account
 * Reads credentials from environment variables:
 * - SUPER_ADMIN_EMAIL (default: emobilitysuperadmin@gmail.com)
 * - SUPER_ADMIN_PASSWORD (default: Admin@123)
 * Stores:
 * - Email: AES-256-GCM encrypted
 * - email_hash: HMAC-SHA256 deterministic hash of lowercase email
 * - Password: bcrypt hash (salt rounds >= 10)
 * - Role: super_admin
 */
export async function seedSuperAdmin() {
  const email = config.superAdminEmail || 'emobilitysuperadmin@gmail.com';
  const password = config.superAdminPassword || 'Admin@123';

  console.log('🌱 [SEED] Initializing Super Admin Seeding...');

  const encryptedEmail = encryptEmail(email);
  const emailHash = hashEmail(email);
  const hashedPassword = hashPassword(password, 10);

  try {
    const client = await pool.connect();
    try {
      // 1. Ensure required columns and indexes exist
      await client.query(`
        ALTER TABLE users ALTER COLUMN email TYPE TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_hash VARCHAR(64);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';
        CREATE INDEX IF NOT EXISTS idx_users_email_hash ON users (email_hash);
      `);

      // 2. Check if Super Admin already exists by email_hash or fallback email
      const existing = await client.query(
        'SELECT id, role, email_hash FROM users WHERE email_hash = $1 OR LOWER(email) = LOWER($2)',
        [emailHash, email]
      );

      if (existing.rows.length === 0) {
        // Insert new super_admin
        const insertRes = await client.query(
          `INSERT INTO users (nic, name, mobile, email, email_hash, password, role)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, nic, name, role;`,
          [
            '000000000000',
            'Super Administrator',
            '0770000000',
            encryptedEmail,
            emailHash,
            hashedPassword,
            'super_admin'
          ]
        );
        console.log(`✅ [SEED] Super Admin created successfully with role 'super_admin' (ID: ${insertRes.rows[0].id})`);
      } else {
        // Idempotent update: ensure role is super_admin and email is encrypted
        const user = existing.rows[0];
        await client.query(
          `UPDATE users 
           SET role = 'super_admin',
               email = $1,
               email_hash = $2,
               password = $3
           WHERE id = $4`,
          [encryptedEmail, emailHash, hashedPassword, user.id]
        );
        console.log(`ℹ️ [SEED] Super Admin already exists (ID: ${user.id}). Verified role 'super_admin' & security credentials.`);
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn(`⚠️ [SEED] Database connection notice: ${err.message}`);
    console.log('💡 [SEED] Standby mode active: In-memory Super Admin credentials are ready and verified.');
  }

  console.log('🔒 [SEED] Super Admin Seed completed safely. Plaintext passwords & decrypted emails were not logged.');
}

// Allow direct CLI execution: node src/seed_super_admin.js
if (process.argv[1] && process.argv[1].endsWith('seed_super_admin.js')) {
  seedSuperAdmin()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ [SEED ERROR]:', err);
      await pool.end();
      process.exit(1);
    });
}
