import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Priority: backend/.env, then root .env
const envPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env')
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
  jwtExpiresIn: '24h',
  
  // Frontends & CORS
  appUrl: process.env.APP_URL || process.env.ADMIN_FRONTEND_URL || 'http://localhost:5173',
  adminFrontendUrl: process.env.ADMIN_FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173',
  vehiclePortalUrl: process.env.VEHICLE_PORTAL_URL || 'http://localhost:5174',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean),

  // Database
  db: {
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'emobility_db',
    port: parseInt(process.env.PGPORT || '5432', 10),
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 3000,
  },

  // SMTP Email
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || process.env.EMAIL_FROM || '"E-Mobility Sri Lanka" <no-reply@emobility.lk>',
  },

  // Security & Encryption
  encryptionKey: process.env.ENCRYPTION_KEY || 'default_aes256_encryption_key_32_bytes_placeholder!',
  emailHashKey: process.env.EMAIL_HASH_KEY || 'default_hmac_sha256_email_hash_key_placeholder!',

  // Default Super Admin Seed Config
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'emobilitysuperadmin@gmail.com',
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || 'Admin@123'
};

