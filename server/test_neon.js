import pg from 'pg';

const connectionString = 'postgresql://neondb_owner:npg_8AlNmJZMk1EQ@ep-raspy-sunset-b4y0ftbc-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function check() {
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const salesRes = await pool.query('SELECT count(*) as total_sales, sum(amount) as total_volume FROM sales;');
  console.log('✅ Neon Total Sales:', salesRes.rows[0].total_sales);
  console.log('💰 Neon Total Volume:', salesRes.rows[0].total_volume);

  const usersRes = await pool.query('SELECT username, name, role FROM users;');
  console.log('👥 Neon Users:', usersRes.rows);

  await pool.end();
}

check();
