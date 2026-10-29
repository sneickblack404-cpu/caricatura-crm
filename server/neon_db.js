import pg from 'pg';

const NEON_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_8AlNmJZMk1EQ@ep-raspy-sunset-b4y0ftbc-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

let pool = null;

export function getNeonPool() {
  if (!pool && NEON_URL) {
    pool = new pg.Pool({
      connectionString: NEON_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000
    });
    pool.on('error', (err) => {
      console.error('[Neon PostgreSQL] Erro no Pool:', err.message);
    });
  }
  return pool;
}

export async function initNeonDb() {
  const p = getNeonPool();
  if (!p) return null;
  try {
    const client = await p.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS crm_app_data (
          key VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log('[Neon PostgreSQL] Conectado e tabelas verificadas com sucesso!');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Neon PostgreSQL] Falha ao inicializar:', err.message);
  }
}

export async function loadNeonDb() {
  const p = getNeonPool();
  if (!p) return null;
  try {
    const res = await p.query("SELECT data FROM crm_app_data WHERE key = 'main' LIMIT 1;");
    if (res.rows.length > 0 && res.rows[0].data) {
      console.log(`[Neon PostgreSQL] Dados carregados do Neon (${res.rows[0].data.sales?.length || 0} vendas).`);
      return res.rows[0].data;
    }
  } catch (err) {
    console.error('[Neon PostgreSQL] Erro ao carregar dados:', err.message);
  }
  return null;
}

let isSaving = false;
let pendingSaveData = null;

export async function saveNeonDb(data) {
  const p = getNeonPool();
  if (!p || !data) return;

  if (isSaving) {
    pendingSaveData = data;
    return;
  }

  isSaving = true;
  try {
    const jsonStr = JSON.stringify(data);
    await p.query(`
      INSERT INTO crm_app_data (key, data, updated_at)
      VALUES ('main', $1, NOW())
      ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `, [jsonStr]);
  } catch (err) {
    console.error('[Neon PostgreSQL] Erro ao salvar estado:', err.message);
  } finally {
    isSaving = false;
    if (pendingSaveData) {
      const nextData = pendingSaveData;
      pendingSaveData = null;
      saveNeonDb(nextData);
    }
  }
}
