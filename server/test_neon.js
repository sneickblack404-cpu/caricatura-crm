import pg from 'pg';

const connectionString = 'postgresql://neondb_owner:npg_8AlNmJZMk1EQ@ep-raspy-sunset-b4y0ftbc-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function testConnection() {
  console.log('Connecting to Neon PostgreSQL...');
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query('SELECT NOW() as current_time, version();');
    console.log('✅ Connection successful!');
    console.log('Neon Current Time:', res.rows[0].current_time);
    console.log('Version:', res.rows[0].version.substring(0, 50));
    await pool.end();
  } catch (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  }
}

testConnection();
