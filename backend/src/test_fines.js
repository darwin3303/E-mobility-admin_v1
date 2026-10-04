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
    const query = `
      SELECT 
        f.id,
        f.police_station,
        f.offence,
        f.date,
        f.due_date,
        f.amount,
        f.demerit_points,
        f.vehicle_plate,
        f.status,
        f.due_days,
        f.location_coords,
        f.evidence_image,
        f.speed_recorded,
        f.speed_limit,
        f.officer_badge,
        f.receipt_no,
        f.paid_at,
        v.make,
        v.model,
        v.year,
        v.type,
        v.owner_nic
      FROM fines f
      LEFT JOIN vehicles v ON UPPER(REPLACE(REPLACE(v.plate, '-', ''), ' ', '')) = UPPER(REPLACE(REPLACE(f.vehicle_plate, '-', ''), ' ', ''))
      ORDER BY f.date DESC;
    `;
    const res = await pool.query(query);
    console.log('Query result count:', res.rows.length);
    console.log('Fines with linked vehicle data:', res.rows);
  } catch (e) {
    console.error('Test error:', e);
  } finally {
    await pool.end();
  }
}

main();
