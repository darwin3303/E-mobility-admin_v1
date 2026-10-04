import { pool } from './config/db.js';
import { encryptEmail, hashEmail } from './utils/crypto.utils.js';

export async function runMigrations() {
  console.log('🔄 [MIGRATION] Running Database Migrations...');
  try {
    const client = await pool.connect();
    try {
      // 1. Check if users table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'users'
        );
      `);

      if (!tableCheck.rows[0].exists) {
        console.log('ℹ️ [MIGRATION] Users table does not exist yet. Will be initialized on startup.');
        return;
      }

      // 2. Alter column types & add email_hash
      await client.query(`
        ALTER TABLE users ALTER COLUMN email TYPE TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_hash VARCHAR(64);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';
        CREATE INDEX IF NOT EXISTS idx_users_email_hash ON users (email_hash);
      `);
      console.log('✅ [MIGRATION] Schema updated: email (TEXT), email_hash (VARCHAR(64)), role (VARCHAR(20)).');

      // 3. Migrate any existing plaintext emails to AES-256-GCM encrypted + HMAC email_hash
      const unmigrated = await client.query(`
        SELECT id, email FROM users WHERE email IS NOT NULL AND email_hash IS NULL;
      `);

      if (unmigrated.rows.length > 0) {
        console.log(`🔒 [MIGRATION] Encrypting and hashing emails for ${unmigrated.rows.length} existing user(s)...`);
        for (const row of unmigrated.rows) {
          const plainEmail = row.email;
          const encrypted = encryptEmail(plainEmail);
          const hash = hashEmail(plainEmail);
          await client.query(
            `UPDATE users SET email = $1, email_hash = $2 WHERE id = $3`,
            [encrypted, hash, row.id]
          );
        }
        console.log('✅ [MIGRATION] Existing emails encrypted and hashed successfully.');
      }

      // 4. Ensure existing NULL or 'user' admin accounts keep admin role if appropriate
      await client.query(`
        UPDATE users SET role = 'admin' WHERE role IS NULL;
      `);

      // 5. Add Admin Activation, Set-Password, and Profile Photo fields to users
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_token VARCHAR(128);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_expires_at TIMESTAMP;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS personal_email TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS personal_email_hash VARCHAR(64);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_setup_token VARCHAR(128);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_setup_expires_at TIMESTAMP;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by INT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by INT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
        CREATE INDEX IF NOT EXISTS idx_users_activation_token ON users (activation_token);
        CREATE INDEX IF NOT EXISTS idx_users_password_setup_token ON users (password_setup_token);
        CREATE INDEX IF NOT EXISTS idx_users_personal_email_hash ON users (personal_email_hash);
      `);

      // 6. Create login_audits table for daily login verification & 14-day retention
      await client.query(`
        CREATE TABLE IF NOT EXISTS login_audits (
          id SERIAL PRIMARY KEY,
          user_id INT,
          user_name VARCHAR(100),
          user_email VARCHAR(150),
          role VARCHAR(30) DEFAULT 'admin',
          ip_address VARCHAR(64),
          device_info TEXT,
          login_status VARCHAR(20) DEFAULT 'SUCCESS',
          verification_status VARCHAR(20) DEFAULT 'VERIFIED',
          photo_filename TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '14 days')
        );
        CREATE INDEX IF NOT EXISTS idx_login_audits_user_id ON login_audits(user_id);
        CREATE INDEX IF NOT EXISTS idx_login_audits_timestamp ON login_audits(timestamp);
      `);

      // 7. Create audit_photo_views table to track when Super Admins view verification photos
      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_photo_views (
          id SERIAL PRIMARY KEY,
          audit_id INT REFERENCES login_audits(id) ON DELETE CASCADE,
          super_admin_id INT,
          super_admin_email VARCHAR(150),
          ip_address VARCHAR(64),
          viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_audit_photo_views_audit_id ON audit_photo_views(audit_id);
      `);

      console.log('🎉 [MIGRATION] All migrations executed successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('⚠️ [MIGRATION] Database connection warning:', err.message);
  }
}

// Allow direct CLI execution: node src/migrate.js
// Also used in start:prod chain: node src/migrate.js && node src/index.js
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ [MIGRATION ERROR]:', err);
      await pool.end();
      process.exit(1);
    });
}
