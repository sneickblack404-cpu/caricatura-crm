import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'crm_data.json');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_8AlNmJZMk1EQ@ep-raspy-sunset-b4y0ftbc-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function migrate() {
  console.log('🚀 Iniciando Migração para o Neon PostgreSQL...');

  if (!fs.existsSync(DB_FILE)) {
    console.error('Arquivo crm_data.json não encontrado!');
    process.exit(1);
  }

  const localDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const sales = localDb.sales || [];
  const users = localDb.users || [];
  const expenses = localDb.expenses || [];
  const adSpends = localDb.adSpends || [];
  const whatsapps = localDb.whatsapps || [];

  console.log(`Carregados do arquivo local: ${sales.length} vendas, ${users.length} usuários, ${expenses.length} despesas.`);

  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Criar tabela mestre crm_app_data (JSONB store para sincronização perfeita de todo o estado)
    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_app_data (
        key VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Criar tabelas relacionais para consultas SQL no Neon Console
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(100) PRIMARY KEY,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50),
        attendant_id VARCHAR(100),
        attendant_name VARCHAR(255),
        whatsapp_id VARCHAR(100),
        whatsapp_name VARCHAR(255),
        profession VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        raw_data JSONB
      );

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        session_version INT DEFAULT 1,
        daily_goal NUMERIC(10, 2),
        monthly_goal NUMERIC(10, 2),
        color VARCHAR(50),
        avatar VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ad_spends (
        id VARCHAR(100) PRIMARY KEY,
        date VARCHAR(20) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        source VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );
    `);

    // 3. Salvar estado mestre no crm_app_data
    await client.query(`
      INSERT INTO crm_app_data (key, data, updated_at)
      VALUES ('main', $1, NOW())
      ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `, [JSON.stringify(localDb)]);

    console.log('✅ Estado mestre salvo em crm_app_data.');

    // 4. Migrar Usuários
    for (const u of users) {
      await client.query(`
        INSERT INTO users (id, username, password, name, role, active, session_version, daily_goal, monthly_goal, color, avatar)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          active = EXCLUDED.active,
          session_version = EXCLUDED.session_version,
          daily_goal = EXCLUDED.daily_goal,
          monthly_goal = EXCLUDED.monthly_goal,
          color = EXCLUDED.color,
          avatar = EXCLUDED.avatar;
      `, [
        u.id,
        u.username,
        u.password,
        u.name,
        u.role || 'atendente',
        u.active !== false,
        u.sessionVersion || 1,
        u.dailyGoal || 160.00,
        u.monthlyGoal || 15000.00,
        u.color || '',
        u.avatar || ''
      ]);
    }
    console.log(`✅ ${users.length} usuários migrados.`);

    // 5. Migrar Vendas em Lotes (Batch) para performance máxima
    console.log(`Migrando ${sales.length} vendas para o Neon...`);
    for (const s of sales) {
      const createdAt = s.createdAt ? new Date(s.createdAt) : new Date();
      const updatedAt = s.updatedAt ? new Date(s.updatedAt) : createdAt;

      await client.query(`
        INSERT INTO sales (
          id, customer_name, customer_phone, amount, status, payment_method,
          attendant_id, attendant_name, whatsapp_id, whatsapp_name, profession,
          notes, created_at, updated_at, raw_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          customer_phone = EXCLUDED.customer_phone,
          amount = EXCLUDED.amount,
          status = EXCLUDED.status,
          payment_method = EXCLUDED.payment_method,
          attendant_id = EXCLUDED.attendant_id,
          attendant_name = EXCLUDED.attendant_name,
          whatsapp_id = EXCLUDED.whatsapp_id,
          whatsapp_name = EXCLUDED.whatsapp_name,
          profession = EXCLUDED.profession,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at,
          raw_data = EXCLUDED.raw_data;
      `, [
        s.id,
        s.customerName || '',
        s.customerPhone || '',
        Number(s.amount) || 0,
        s.status || 'pago',
        s.paymentMethod || 'pix',
        s.attendantId || '',
        s.attendantName || '',
        s.whatsappId || '',
        s.whatsappName || '',
        s.profession || '',
        s.notes || '',
        createdAt,
        updatedAt,
        JSON.stringify(s)
      ]);
    }
    console.log(`✅ ${sales.length} vendas migradas com sucesso.`);

    // 6. Migrar Gastos Extras
    for (const e of expenses) {
      await client.query(`
        INSERT INTO expenses (id, title, amount, category, date, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          amount = EXCLUDED.amount,
          category = EXCLUDED.category,
          date = EXCLUDED.date,
          notes = EXCLUDED.notes;
      `, [e.id, e.title || '', Number(e.amount) || 0, e.category || 'outro', e.date || '', e.notes || '']);
    }
    console.log(`✅ ${expenses.length} despesas migradas.`);

    // 7. Migrar Gastos com Meta Ads
    for (const a of adSpends) {
      await client.query(`
        INSERT INTO ad_spends (id, date, amount, source)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          amount = EXCLUDED.amount,
          source = EXCLUDED.source;
      `, [a.id, a.date, Number(a.amount) || 0, a.source || 'manual']);
    }
    console.log(`✅ ${adSpends.length} registros de anúncios migrados.`);

    await client.query('COMMIT');

    // 8. Verificação Final de Contagem no Neon
    const countRes = await client.query('SELECT COUNT(*) as total FROM sales;');
    const userCountRes = await client.query('SELECT COUNT(*) as total FROM users;');
    console.log('🎉 Migração Concluída com Sucesso!');
    console.log(`📊 Total de Vendas no Neon: ${countRes.rows[0].total}`);
    console.log(`👥 Total de Usuários no Neon: ${userCountRes.rows[0].total}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro durante a migração:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
