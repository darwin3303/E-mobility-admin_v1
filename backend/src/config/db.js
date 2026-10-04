import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './env.js';
import { encryptEmail, hashEmail, hashPassword } from '../utils/crypto.utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// PostgreSQL Connection Pool
export const pool = new Pool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  ssl: config.db.ssl,
  connectionTimeoutMillis: config.db.connectionTimeoutMillis,
});

let isDbConnected = false;

/**
 * Initialize database schema and initial seed data if PostgreSQL is running
 */
export async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('⚡ Connected to PostgreSQL Database successfully!');
    isDbConnected = true;

    // Create Core Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nic VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        email TEXT,
        email_hash VARCHAR(64),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE users ALTER COLUMN email TYPE TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_hash VARCHAR(64);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS personal_email TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS personal_email_hash VARCHAR(64);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_setup_token VARCHAR(128);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_setup_expires_at TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';
      CREATE INDEX IF NOT EXISTS idx_users_email_hash ON users (email_hash);
      CREATE INDEX IF NOT EXISTS idx_users_password_setup_token ON users (password_setup_token);

      CREATE TABLE IF NOT EXISTS vehicle_registry (
        registration_id VARCHAR(50) PRIMARY KEY,
        vin VARCHAR(100) UNIQUE,
        license_plate VARCHAR(50) UNIQUE NOT NULL,
        make VARCHAR(50) NOT NULL,
        model VARCHAR(50) NOT NULL,
        year INT NOT NULL,
        color VARCHAR(50),
        fuel_type VARCHAR(50),
        body_type VARCHAR(50),
        owner_first_name VARCHAR(100),
        owner_last_name VARCHAR(100),
        owner_email VARCHAR(150),
        owner_phone VARCHAR(50),
        registration_issue_date VARCHAR(50),
        registration_expiry_date VARCHAR(50),
        registration_status VARCHAR(50) DEFAULT 'Active',
        last_inspection_date VARCHAR(50),
        inspection_result VARCHAR(50),
        station_code VARCHAR(50)
      );

      CREATE INDEX IF NOT EXISTS idx_vehicle_registry_plate ON vehicle_registry (license_plate);
      CREATE INDEX IF NOT EXISTS idx_vehicle_registry_vin ON vehicle_registry (vin);

      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(50) PRIMARY KEY,
        plate VARCHAR(50) UNIQUE NOT NULL,
        make VARCHAR(50) NOT NULL,
        model VARCHAR(50) NOT NULL,
        year INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        battery_level INT DEFAULT 100,
        revenue_license_status VARCHAR(20) DEFAULT 'Valid',
        license_expiry DATE,
        qr_code VARCHAR(100),
        owner_nic VARCHAR(50),
        owner_id INT REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS fines (
        id VARCHAR(50) PRIMARY KEY,
        police_station VARCHAR(100) NOT NULL,
        offence TEXT NOT NULL,
        date DATE NOT NULL,
        due_date VARCHAR(50),
        amount INT NOT NULL,
        demerit_points INT DEFAULT 0,
        vehicle_plate VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'Unpaid',
        due_days INT DEFAULT 0,
        location_coords TEXT,
        evidence_image BOOLEAN DEFAULT TRUE,
        speed_recorded VARCHAR(20),
        speed_limit VARCHAR(20),
        officer_badge VARCHAR(100),
        receipt_no VARCHAR(50),
        paid_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS disputes (
        id VARCHAR(50) PRIMARY KEY,
        fine_id VARCHAR(50) REFERENCES fines(id),
        reason TEXT NOT NULL,
        date_submitted DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Under Review',
        remarks TEXT
      );

      CREATE TABLE IF NOT EXISTS charging_stations (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location TEXT NOT NULL,
        distance VARCHAR(20),
        available_plugs INT,
        total_plugs INT,
        power VARCHAR(50),
        price_per_kwh VARCHAR(50),
        status VARCHAR(20) DEFAULT 'Available'
      );
    `);

    // Import CSV records into PostgreSQL if vehicle_registry is empty
    const regCheck = await client.query('SELECT COUNT(*) FROM vehicle_registry');
    if (parseInt(regCheck.rows[0].count, 10) === 0) {
      await importCsvToDatabase(client);
    }

    // Seed Default Super Admin and Admin Accounts (Idempotent)
    try {
      // 1. Super Admin Seeding
      const saEmail = config.superAdminEmail || 'emobilitysuperadmin@gmail.com';
      const saPass = config.superAdminPassword || 'Admin@123';
      const saEncrypted = encryptEmail(saEmail);
      const saHash = hashEmail(saEmail);
      const saBcrypt = hashPassword(saPass, 10);

      const saCheck = await client.query('SELECT id FROM users WHERE email_hash = $1 OR LOWER(email) = LOWER($2)', [saHash, saEmail]);
      if (saCheck.rows.length === 0) {
        await client.query(
          `INSERT INTO users (nic, name, mobile, email, email_hash, password, role)
           VALUES ($1, $2, $3, $4, $5, $6, $7);`,
          ['000000000000', 'Super Administrator', '0770000000', saEncrypted, saHash, saBcrypt, 'super_admin']
        );
        console.log('👑 Super Admin account seeded in PostgreSQL.');
      } else {
        await client.query(
          `UPDATE users SET role = 'super_admin', email = $1, email_hash = $2, password = $3 WHERE id = $4;`,
          [saEncrypted, saHash, saBcrypt, saCheck.rows[0].id]
        );
      }

      // 2. Regular Admin Seeding
      const adminEmail = 'nipunsudusinghe523@gmail.com';
      const adminPass = '123456';
      const adminEncrypted = encryptEmail(adminEmail);
      const adminHash = hashEmail(adminEmail);
      const adminBcrypt = hashPassword(adminPass, 10);

      const adminExists = await client.query('SELECT id FROM users WHERE email_hash = $1 OR LOWER(email) = LOWER($2)', [adminHash, adminEmail]);
      if (adminExists.rows.length === 0) {
        await client.query(
          `INSERT INTO users (nic, name, mobile, email, email_hash, password, role)
           VALUES ($1, $2, $3, $4, $5, $6, $7);`,
          ['199852300001', 'Nipun Sudusinghe', '0771234567', adminEncrypted, adminHash, adminBcrypt, 'admin']
        );
        console.log('👑 Admin account seeded in PostgreSQL.');
      } else {
        await client.query(
          `UPDATE users SET role = 'admin', email = $1, email_hash = $2, password = $3 WHERE id = $4;`,
          [adminEncrypted, adminHash, adminBcrypt, adminExists.rows[0].id]
        );
      }
    } catch (adminErr) {
      console.warn('Account seeding note:', adminErr.message);
    }

    client.release();
    console.log('✅ PostgreSQL Schema & Vehicle Registry database ready!');
    return true;
  } catch (err) {
    console.warn('⚠️ PostgreSQL Connection Warning:', err.message);
    console.warn('💡 Standby Mode: Backend is running in standalone mode with simulated storage.');
    isDbConnected = false;
    return false;
  }
}

/**
 * Bulk insert vehicle registry CSV records into PostgreSQL
 */
async function importCsvToDatabase(client) {
  const csvPath = path.resolve(__dirname, '../../data/vehicle_registry_7000_records.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('CSV file not found at:', csvPath);
    return;
  }

  console.log('📥 Importing 7,000 vehicle registry records into PostgreSQL...');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return;

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length >= 19) {
      records.push([
        cols[0].trim(),  // registration_id
        cols[1].trim(),  // vin
        cols[2].trim(),  // license_plate
        cols[3].trim(),  // make
        cols[4].trim(),  // model
        parseInt(cols[5].trim(), 10) || 2020, // year
        cols[6].trim(),  // color
        cols[7].trim(),  // fuel_type
        cols[8].trim(),  // body_type
        cols[9].trim(),  // owner_first_name
        cols[10].trim(), // owner_last_name
        cols[11].trim(), // owner_email
        cols[12].trim(), // owner_phone
        cols[13].trim(), // registration_issue_date
        cols[14].trim(), // registration_expiry_date
        cols[15].trim(), // registration_status
        cols[16].trim(), // last_inspection_date
        cols[17].trim(), // inspection_result
        cols[18].trim(), // station_code
      ]);
    }
  }

  // Chunked batch insertion (500 rows per batch)
  const batchSize = 500;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const valuePlaceholders = [];
    const flatValues = [];
    let paramIndex = 1;

    for (const r of batch) {
      const placeholders = [];
      for (let j = 0; j < 19; j++) {
        placeholders.push(`$${paramIndex++}`);
        flatValues.push(r[j]);
      }
      valuePlaceholders.push(`(${placeholders.join(', ')})`);
    }

    const queryText = `
      INSERT INTO vehicle_registry (
        registration_id, vin, license_plate, make, model, year, color, fuel_type, body_type,
        owner_first_name, owner_last_name, owner_email, owner_phone, registration_issue_date,
        registration_expiry_date, registration_status, last_inspection_date, inspection_result, station_code
      ) VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT (license_plate) DO NOTHING;
    `;

    await client.query(queryText, flatValues);
  }

  console.log(`✅ Successfully imported ${records.length} records into vehicle_registry table!`);
}

export function isPostgresConnected() {
  return isDbConnected;
}
