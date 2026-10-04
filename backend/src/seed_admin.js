import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const pool = new Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: '123',
  database: 'emobility_db',
  port: 5432
});

async function main() {
  try {
    const adminEmail = 'nipunsudusinghe523@gmail.com';
    const adminPass = '123456';
    const hashedPassword = bcrypt.hashSync(adminPass, 10);

    // Check if user exists
    const check = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

    if (check.rows.length > 0) {
      await pool.query(
        `UPDATE users SET password = $1, role = 'admin', name = 'Nipun Sudusinghe' WHERE email = $2`,
        [hashedPassword, adminEmail]
      );
      console.log(`✅ Admin account (${adminEmail}) updated successfully with secure bcrypt password!`);
    } else {
      await pool.query(
        `INSERT INTO users (nic, name, mobile, email, password, role)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['200055109876', 'Nipun Sudusinghe', '0771234567', adminEmail, hashedPassword, 'admin']
      );
      console.log(`✅ Admin account (${adminEmail}) created successfully!`);
    }

    const verify = await pool.query('SELECT id, nic, name, email, role, password FROM users WHERE email = $1', [adminEmail]);
    console.log('Verified user record:', verify.rows[0]);
    console.log('Password test (123456):', bcrypt.compareSync('123456', verify.rows[0].password));
    console.log('Password test (wrong):', bcrypt.compareSync('wrongpass', verify.rows[0].password));
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    await pool.end();
  }
}

main();
