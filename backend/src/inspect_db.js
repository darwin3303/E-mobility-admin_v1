import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: '123',
  database: 'emobility_db',
  port: 5432
});

async function inspect() {
  try {
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    );
    console.log('Tables:', tables.rows.map(t => t.table_name));

    for (const t of tables.rows) {
      const cols = await pool.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position;",
        [t.table_name]
      );
      console.log(`\nTable [${t.table_name}]:`);
      console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
      
      const count = await pool.query(`SELECT COUNT(*) FROM "${t.table_name}";`);
      console.log(`Count in ${t.table_name}:`, count.rows[0].count);
    }
  } catch (err) {
    console.error('Inspection error:', err);
  } finally {
    await pool.end();
  }
}

inspect();
