import pg from 'pg';

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
    console.log('=== VEHICLES ===');
    const vehs = await pool.query('SELECT * FROM vehicles;');
    console.log(vehs.rows);

    console.log('\n=== FINES ===');
    const fines = await pool.query('SELECT * FROM fines;');
    console.log(fines.rows);

    console.log('\n=== VIOLATIONS ===');
    const viols = await pool.query('SELECT * FROM violations LIMIT 5;');
    console.log(viols.rows);

    console.log('\n=== TICKETS ===');
    const tix = await pool.query('SELECT * FROM tickets LIMIT 5;');
    console.log(tix.rows);

    console.log('\n=== CAMERAS ===');
    const cams = await pool.query('SELECT * FROM cameras LIMIT 5;');
    console.log(cams.rows);

  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

main();
