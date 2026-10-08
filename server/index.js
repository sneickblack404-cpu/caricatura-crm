import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, saveDb, generateId } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// O CORS CORRIGIDO ESTÁ AQUI:
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'ngrok-skip-browser-warning', 
    'bypass-tunnel-reminder', 
    'Bypass-Tunnel-Reminder'
  ]
}));

app.use(express.json());

// Servir frontend compilado se existir
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Helper para filtrar por período de datas
function filterByPeriod(items, period, startDateStr, endDateStr, dateField = 'createdAt') {
  const now = new Date();
  
  return items.filter(item => {
    const itemDate = new Date(item[dateField] || item.date || item.createdAt);
    
    switch (period) {
      case 'hoje': {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        return itemDate >= start && itemDate <= end;
      }
      case 'ontem': {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
        const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
        return itemDate >= start && itemDate <= end;
      }
      case '7d': {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= start && itemDate <= now;
      }
      case '15d': {
        const start = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        return itemDate >= start && itemDate <= now;
      }
      case '30d': {
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= start && itemDate <= now;
      }
      case 'este_mes': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        return itemDate >= start && itemDate <= now;
      }
      case 'mes_passado': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        return itemDate >= start && itemDate <= end;
      }
      case '3_meses': {
        const start = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0);
        return itemDate >= start && itemDate <= now;
      }
      case 'ano': {
        const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        return itemDate >= start && itemDate <= now;
      }
      case 'personalizado': {
        if (!startDateStr || !endDateStr) return true;
        const start = new Date(`${startDateStr}T00:00:00`);
        const end = new Date(`${endDateStr}T23:59:59`);
        return itemDate >= start && itemDate <= end;
      }
      default:
        return true;
    }
  });
}

// 1. Autenticação (Login)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = getDb();

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }

  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();

  const found = db.users.find(u => 
    u.username?.toLowerCase() === cleanUser && u.password === cleanPass && u.active !== false
  );

  if (!found) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  const { password: _, ...userSafe } = found;
  res.json({ user: userSafe });
});

// 2. Informações de Inicialização (Bootstrap)
app.get('/api/bootstrap', (req, res) => {
  const db = getDb();
  // Assegura meta diária de R$ 160 para todos
  db.users.forEach(u => {
    if (!u.dailyGoal || u.dailyGoal === 500 || u.dailyGoal === 700 || u.dailyGoal === 1000) {
      u.dailyGoal = 160.00;
    }
  });
  saveDb(db);

  const safeUsers = db.users.map(({ password, ...u }) => u);
  res.json({
    settings: db.settings,
    users: safeUsers,
    whatsapps: db.whatsapps
  });
});

// 3. Usuários / Atendentes
app.get('/api/users', (req, res) => {
  const db = getDb();
  const safeUsers = db.users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

// Atualizar perfil (personalizável com nome, telefone e cor de destaque)
app.put('/api/users/:id', (req, res) => {
  const db = getDb();
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Usuário não encontrado' });

  const { name, phone, avatar, color, themeColor } = req.body;
  if (name) {
    db.users[index].name = name.trim();
    if (!avatar) {
      db.users[index].avatar = name.trim()[0].toUpperCase();
    }
  }
  if (phone !== undefined) db.users[index].phone = phone;
  if (avatar) db.users[index].avatar = avatar;
  if (color) db.users[index].color = color;
  if (themeColor) db.users[index].themeColor = themeColor; // 'amarelo', 'azul', 'verde', 'rosa'

  saveDb(db);
  const { password, ...safeUser } = db.users[index];
  res.json(safeUser);
});

// 4. WhatsApps
app.get('/api/whatsapps', (req, res) => {
  const db = getDb();
  res.json(db.whatsapps);
});

app.post('/api/whatsapps', (req, res) => {
  const db = getDb();
  const { name, number, color, description } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: 'Nome e número são obrigatórios' });
  }

  const colors = ['#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#14B8A6'];
  const newWpp = {
    id: generateId('wpp'),
    name,
    number: number.replace(/\D/g, ''),
    color: color || colors[Math.floor(Math.random() * colors.length)],
    description: description || '',
    active: true,
    createdAt: new Date().toISOString()
  };

  db.whatsapps.push(newWpp);
  saveDb(db);
  res.status(201).json(newWpp);
});

app.put('/api/whatsapps/:id', (req, res) => {
  const db = getDb();
  const index = db.whatsapps.findIndex(w => w.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'WhatsApp não encontrado' });

  db.whatsapps[index] = { ...db.whatsapps[index], ...req.body };
  saveDb(db);
  res.json(db.whatsapps[index]);
});

// 5. Vendas
app.get('/api/sales', (req, res) => {
  const db = getDb();
  const { attendantId, whatsappId, period = 'hoje', startDate, endDate } = req.query;

  let filtered = filterByPeriod(db.sales, period, startDate, endDate);

  if (attendantId && attendantId !== 'all') {
    filtered = filtered.filter(s => s.attendantId === attendantId);
  }

  if (whatsappId && whatsappId !== 'all') {
    filtered = filtered.filter(s => s.whatsappId === whatsappId);
  }

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(filtered);
});

app.post('/api/sales', (req, res) => {
  const db = getDb();
  const {
    attendantId,
    whatsappId,
    customerPhone,
    profession = 'Caminhoneiro',
    amount,
    paymentMethod = 'pix',
    notes,
    status = 'pago'
  } = req.body;

  if (!attendantId || !amount) {
    return res.status(400).json({ error: 'Atendente e valor da venda são obrigatórios' });
  }

  const attendant = db.users.find(u => u.id === attendantId);
  const whatsapp = db.whatsapps.find(w => w.id === whatsappId);
  const cleanPhone = (customerPhone || '').replace(/\D/g, '');
  const numericAmount = Math.max(0, Number(amount) || 0);
  const finalProfession = (profession || 'Caminhoneiro').trim();
  const finalPaymentMethod = (paymentMethod || 'pix').trim();

  const newSale = {
    id: generateId('sale'),
    attendantId,
    attendantName: attendant ? attendant.name : 'Atendente',
    whatsappId: whatsappId || (db.whatsapps[0] ? db.whatsapps[0].id : ''),
    whatsappName: whatsapp ? whatsapp.name : 'WhatsApp',
    customerName: req.body.customerName || (cleanPhone ? `Cliente (${cleanPhone.slice(-4)})` : 'Cliente Pix'),
    customerPhone: cleanPhone,
    profession: finalProfession,
    amount: numericAmount,
    paymentMethod: finalPaymentMethod,
    notes: notes || '',
    status,
    createdAt: req.body.createdAt || new Date().toISOString()
  };

  db.sales.unshift(newSale);
  db.sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  saveDb(db);
  res.status(201).json(newSale);
});

app.delete('/api/sales/:id', (req, res) => {
  const db = getDb();
  db.sales = db.sales.filter(s => s.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

app.put('/api/sales/:id', (req, res) => {
  const db = getDb();
  const index = db.sales.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Venda não encontrada' });
  }

  const existing = db.sales[index];
  const {
    attendantId,
    whatsappId,
    customerName,
    customerPhone,
    profession,
    amount,
    paymentMethod,
    notes,
    status,
    createdAt
  } = req.body;

  let attendantName = existing.attendantName;
  if (attendantId) {
    const attendant = db.users.find(u => u.id === attendantId);
    if (attendant) attendantName = attendant.name;
  }

  let whatsappName = existing.whatsappName;
  if (whatsappId) {
    const whatsapp = db.whatsapps.find(w => w.id === whatsappId);
    if (whatsapp) {
      whatsappName = whatsapp.name;
    } else if (whatsappId === 'wpp-3' || whatsappId === 'wpp-direct') {
      whatsappName = 'Tráfego Direto';
    }
  }

  const cleanPhone = customerPhone !== undefined ? (customerPhone || '').replace(/\D/g, '') : existing.customerPhone;
  const numericAmount = amount !== undefined ? Math.max(0, Number(amount) || 0) : existing.amount;

  db.sales[index] = {
    ...existing,
    attendantId: attendantId || existing.attendantId,
    attendantName,
    whatsappId: whatsappId || existing.whatsappId,
    whatsappName,
    customerName: customerName !== undefined ? customerName : existing.customerName,
    customerPhone: cleanPhone,
    profession: profession !== undefined ? profession.trim() : existing.profession,
    amount: numericAmount,
    paymentMethod: paymentMethod || existing.paymentMethod,
    notes: notes !== undefined ? notes : existing.notes,
    status: status || existing.status,
    createdAt: createdAt || existing.createdAt
  };

  db.sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  saveDb(db);
  res.json(db.sales[index]);
});

// 6. Follow-ups
app.get('/api/followups', (req, res) => {
  const db = getDb();
  const { attendantId } = req.query;
  let items = db.followUps || [];
  if (attendantId && attendantId !== 'all') {
    items = items.filter(f => f.attendantId === attendantId);
  }
  res.json(items);
});

app.post('/api/followups', (req, res) => {
  const db = getDb();
  if (!db.followUps) db.followUps = [];

  const newFollowUp = {
    id: generateId('fu'),
    ...req.body,
    status: req.body.status || 'pendente',
    createdAt: new Date().toISOString()
  };

  db.followUps.unshift(newFollowUp);
  saveDb(db);
  res.status(201).json(newFollowUp);
});

app.put('/api/followups/:id', (req, res) => {
  const db = getDb();
  const index = (db.followUps || []).findIndex(f => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Follow-up não encontrado' });

  db.followUps[index] = { ...db.followUps[index], ...req.body };
  saveDb(db);
  res.json(db.followUps[index]);
});

app.delete('/api/followups/:id', (req, res) => {
  const db = getDb();
  const index = (db.followUps || []).findIndex(f => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Follow-up não encontrado' });

  const deleted = db.followUps.splice(index, 1)[0];
  saveDb(db);
  res.json({ success: true, deleted });
});

// 6.1 Gastos Extras & Custos Operacionais (IAs, Softwares, etc.)
app.get('/api/expenses', (req, res) => {
  const db = getDb();
  const { period = 'este_mes', startDate, endDate } = req.query;
  const filtered = filterByPeriod(db.expenses || [], period, startDate, endDate, 'date');
  filtered.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  res.json(filtered);
});

app.post('/api/expenses', (req, res) => {
  const db = getDb();
  if (!db.expenses) db.expenses = [];
  const { title, amount, category = 'ia', date, notes } = req.body;
  
  if (!amount) {
    return res.status(400).json({ error: 'Valor é obrigatório' });
  }

  let finalTitle = (title || '').trim();
  if (!finalTitle) {
    if (category === 'ia') finalTitle = 'Gasto com IA';
    else if (category === 'chip') finalTitle = 'Chip / WhatsApp';
    else if (category === 'ferramenta' || category === 'software') finalTitle = 'Ferramenta';
    else if (category === 'pagamento_atendente') finalTitle = 'Pagamento de Atendente';
    else finalTitle = 'Outro Gasto';
  }

  const newExpense = {
    id: generateId('exp'),
    title: finalTitle,
    amount: Math.max(0, Number(amount) || 0),
    category: category || 'outro',
    date: date || new Date().toISOString().split('T')[0],
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.expenses.unshift(newExpense);
  saveDb(db);
  res.status(201).json(newExpense);
});

app.put('/api/expenses/:id', (req, res) => {
  const db = getDb();
  if (!db.expenses) db.expenses = [];
  const idx = db.expenses.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Gasto não encontrado' });

  db.expenses[idx] = { ...db.expenses[idx], ...req.body };
  saveDb(db);
  res.json(db.expenses[idx]);
});

app.delete('/api/expenses/:id', (req, res) => {
  const db = getDb();
  if (!db.expenses) db.expenses = [];
  db.expenses = db.expenses.filter(e => e.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 6.2 Baixa de Comissões & Extrato de Repasses
app.get('/api/payouts', (req, res) => {
  const db = getDb();
  const { attendantId } = req.query;
  let items = db.commissionPayouts || [];
  if (attendantId && attendantId !== 'all') {
    items = items.filter(p => p.attendantId === attendantId);
  }
  items.sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt));
  res.json(items);
});

app.post('/api/payouts', (req, res) => {
  const db = getDb();
  if (!db.commissionPayouts) db.commissionPayouts = [];
  const { attendantId, amount, paymentMethod = 'pix', notes, referencePeriod } = req.body;
  
  if (!attendantId || !amount) {
    return res.status(400).json({ error: 'Atendente e valor são obrigatórios' });
  }

  const attendant = db.users.find(u => u.id === attendantId);
  const newPayout = {
    id: generateId('payout'),
    attendantId,
    attendantName: attendant ? attendant.name : 'Atendente',
    amount: Math.max(0, Number(amount) || 0),
    paymentMethod,
    status: 'pago',
    paidAt: req.body.paidAt || new Date().toISOString(),
    referencePeriod: referencePeriod || 'Hoje',
    notes: notes || 'Baixa de comissão paga via Pix'
  };

  db.commissionPayouts.unshift(newPayout);
  saveDb(db);
  res.status(201).json(newPayout);
});

app.delete('/api/payouts/:id', (req, res) => {
  const db = getDb();
  if (!db.commissionPayouts) db.commissionPayouts = [];
  db.commissionPayouts = db.commissionPayouts.filter(p => p.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 7. Facebook Ads / Gastos com Tráfego & Meta Graph API
const metaApiCache = new Map();

function normalizeActId(accountId) {
  if (!accountId) return '';
  const trimmed = String(accountId).trim();
  return trimmed.startsWith('act_') ? trimmed : `act_${trimmed}`;
}

function getMetaPeriodParams(period, startDate, endDate) {
  switch (period) {
    case 'hoje':
      return { date_preset: 'today' };
    case 'ontem':
      return { date_preset: 'yesterday' };
    case '7d':
      return { date_preset: 'last_7d' };
    case '15d': {
      const now = new Date();
      const start = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = now.toISOString().split('T')[0];
      return { time_range: JSON.stringify({ since: start, until: end }) };
    }
    case '30d':
      return { date_preset: 'last_30d' };
    case 'este_mes':
      return { date_preset: 'this_month' };
    case 'mes_passado':
      return { date_preset: 'last_month' };
    case '3_meses':
      return { date_preset: 'last_90d' };
    case 'ano':
      return { date_preset: 'this_year' };
    case 'personalizado': {
      if (startDate && endDate) {
        return { time_range: JSON.stringify({ since: startDate, until: endDate }) };
      }
      return { date_preset: 'today' };
    }
    default:
      return { date_preset: 'today' };
  }
}

function getBrazilDateStr(d = new Date()) {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(d);
}

// Fallback de cálculo de gasto de tráfego
function calculateAdSpendForPeriod(db, period, startDate, endDate) {
  const fbConfig = db.settings.facebookAds || {};
  const manualDaily = Number(fbConfig.dailySpendManual) || 60;
  const todayStr = getBrazilDateStr(new Date());

  if (period === 'hoje') {
    const todaySpend = (db.adSpends || []).find(s => s.date === todayStr);
    if (todaySpend && todaySpend.amount !== undefined) return Number(todaySpend.amount);
    return Number(fbConfig.todaySpend) || manualDaily;
  }

  if (period === 'ontem') {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayStr = getBrazilDateStr(yesterday);
    const yestSpend = (db.adSpends || []).find(s => s.date === yesterdayStr);
    if (yestSpend && yestSpend.amount !== undefined) return Number(yestSpend.amount);
    if (fbConfig.yesterdaySpend !== undefined) return Number(fbConfig.yesterdaySpend);
    return manualDaily;
  }

  if (period === 'este_mes' || period === '30d' || period === 'all' || !period) {
    if (fbConfig.lastSpend) return Number(fbConfig.lastSpend);
    return 2325.14;
  }

  if (period === 'mes_passado') {
    return Number(fbConfig.lastSpend) || 2325.14;
  }

  const filtered = filterByPeriod(db.adSpends || [], period, startDate, endDate, 'date');
  const recordedSpend = filtered.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

  if (recordedSpend > 0) return recordedSpend;

  if (period === '7d') return manualDaily * 7;
  if (period === '15d') return manualDaily * 15;
  if (period === '3_meses') return (Number(fbConfig.lastSpend) || 2325.14) * 3;
  if (period === 'ano') return (Number(fbConfig.lastSpend) || 2325.14) * 12;

  return manualDaily;
}

// Busca gasto real no Meta Graph API (v21.0) ou recorre ao fallback manual
async function fetchMetaAdSpend(db, period = 'hoje', startDate, endDate, forceRefresh = false) {
  const fbConfig = db.settings.facebookAds || {};
  const isApiMode = fbConfig.mode === 'api';
  const hasCredentials = Boolean(fbConfig.accessToken && fbConfig.accountId);

  const spendPeriod = Number(fbConfig.lastSpend) || 2325.14;
  const spendToday = Number(fbConfig.todaySpend) || Number(fbConfig.dailySpendManual) || 60;

  if (!isApiMode || !hasCredentials) {
    const manualSpend = calculateAdSpendForPeriod(db, period, startDate, endDate);
    return {
      spend: manualSpend,
      spendPeriod,
      spendToday,
      impressions: 0,
      clicks: 0,
      source: 'manual',
      connected: Boolean(fbConfig.connected && fbConfig.accessToken),
      lastSync: fbConfig.lastSync || null
    };
  }

  const cacheKey = `${period}_${startDate || ''}_${endDate || ''}`;
  const cached = metaApiCache.get(cacheKey);
  if (!forceRefresh && cached && (Date.now() - cached.timestamp < 10000)) {
    return cached.data;
  }

  const actId = normalizeActId(fbConfig.accountId);
  const params = getMetaPeriodParams(period, startDate, endDate);
  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    searchParams.append(k, v);
  }
  searchParams.append('fields', 'spend,impressions,clicks,cpc,cpm');
  searchParams.append('access_token', fbConfig.accessToken);

  const url = `https://graph.facebook.com/v21.0/${actId}/insights?${searchParams.toString()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error('Meta Graph API Error:', data.error.message);
      fbConfig.connected = false;
      fbConfig.lastError = data.error.message;
      saveDb(db);
      const fallbackSpend = calculateAdSpendForPeriod(db, period, startDate, endDate);
      return {
        spend: fallbackSpend,
        spendPeriod,
        spendToday,
        impressions: 0,
        clicks: 0,
        source: 'fallback_error',
        connected: false,
        error: data.error.message,
        lastSync: fbConfig.lastSync || null
      };
    }

    const firstEntry = data.data && data.data[0] ? data.data[0] : null;
    const spend = firstEntry && firstEntry.spend ? parseFloat(firstEntry.spend) : 0;
    const impressions = firstEntry && firstEntry.impressions ? parseInt(firstEntry.impressions, 10) : 0;
    const clicks = firstEntry && firstEntry.clicks ? parseInt(firstEntry.clicks, 10) : 0;

    fbConfig.connected = true;
    fbConfig.lastSync = new Date().toISOString();
    if (period === 'este_mes' || period === '30d') {
      fbConfig.lastSpend = spend;
    }
    if (period === 'hoje') {
      fbConfig.todaySpend = spend;
    }
    if (period === 'ontem') {
      fbConfig.yesterdaySpend = spend;
    }
    delete fbConfig.lastError;

    // Sincroniza na tabela de adSpends
    if (period === 'hoje' || period === 'ontem') {
      const targetDateStr = period === 'hoje' 
        ? getBrazilDateStr(new Date()) 
        : getBrazilDateStr(new Date(Date.now() - 24 * 60 * 60 * 1000));
      if (!db.adSpends) db.adSpends = [];
      const existingIdx = db.adSpends.findIndex(s => s.date === targetDateStr);
      if (existingIdx !== -1) {
        db.adSpends[existingIdx].amount = spend;
        db.adSpends[existingIdx].source = 'facebook_api';
        db.adSpends[existingIdx].updatedAt = new Date().toISOString();
      } else {
        db.adSpends.push({
          id: generateId('spend'),
          date: targetDateStr,
          amount: spend,
          source: 'facebook_api',
          createdAt: new Date().toISOString()
        });
      }
    }
    saveDb(db);

    const result = {
      spend,
      spendPeriod: Number(fbConfig.lastSpend) || 2325.14,
      spendToday: Number(fbConfig.todaySpend) || 58.01,
      spendYesterday: Number(fbConfig.yesterdaySpend) || 132.52,
      impressions,
      clicks,
      source: 'meta_api',
      connected: true,
      lastSync: fbConfig.lastSync,
      dateStart: firstEntry?.date_start,
      dateStop: firstEntry?.date_stop
    };

    metaApiCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  } catch (err) {
    console.error('Fetch Meta Graph API network error:', err.message);
    const fallbackSpend = calculateAdSpendForPeriod(db, period, startDate, endDate);
    return {
      spend: fallbackSpend,
      spendPeriod,
      spendToday,
      spendYesterday: Number(fbConfig.yesterdaySpend) || 132.52,
      impressions: 0,
      clicks: 0,
      source: 'fallback_error',
      connected: false,
      error: err.message,
      lastSync: fbConfig.lastSync || null
    };
  }
}

app.get('/api/facebook/config', (req, res) => {
  const db = getDb();
  const fb = db.settings.facebookAds || {};
  const yesterdayStr = getBrazilDateStr(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const yestEntry = (db.adSpends || []).find(s => s.date === yesterdayStr);
  const yesterdaySpend = yestEntry?.amount !== undefined ? yestEntry.amount : (fb.yesterdaySpend !== undefined ? fb.yesterdaySpend : 132.52);

  res.json({
    connected: fb.connected || false,
    accountId: fb.accountId || '2247424592846418',
    dailySpendManual: fb.dailySpendManual || 60,
    todaySpend: fb.todaySpend !== undefined ? fb.todaySpend : 0.80,
    yesterdaySpend: Number(yesterdaySpend) || 132.52,
    mode: fb.mode || 'manual',
    hasToken: Boolean(fb.accessToken),
    lastSync: fb.lastSync || null,
    lastSpend: fb.lastSpend || null,
    lastError: fb.lastError || null
  });
});

app.post('/api/facebook/config', async (req, res) => {
  const db = getDb();
  const { accountId, accessToken, dailySpendManual, todaySpend, yesterdaySpend, mode } = req.body;

  if (!db.settings.facebookAds) db.settings.facebookAds = {};
  
  if (accountId !== undefined && accountId.trim()) {
    db.settings.facebookAds.accountId = accountId.trim();
  }
  if (accessToken !== undefined && accessToken.trim()) {
    db.settings.facebookAds.accessToken = accessToken.trim();
  }
  if (dailySpendManual !== undefined) {
    db.settings.facebookAds.dailySpendManual = Math.max(0, Number(dailySpendManual) || 0);
  }
  if (todaySpend !== undefined) {
    const num = Math.max(0, Number(todaySpend) || 0);
    db.settings.facebookAds.todaySpend = num;
    const todayStr = getBrazilDateStr(new Date());
    if (!db.adSpends) db.adSpends = [];
    const idx = db.adSpends.findIndex(s => s.date === todayStr);
    if (idx !== -1) {
      db.adSpends[idx].amount = num;
      db.adSpends[idx].updatedAt = new Date().toISOString();
    } else {
      db.adSpends.push({
        id: generateId('spend'),
        date: todayStr,
        amount: num,
        source: 'manual',
        createdAt: new Date().toISOString()
      });
    }
  }
  if (yesterdaySpend !== undefined) {
    const num = Math.max(0, Number(yesterdaySpend) || 0);
    db.settings.facebookAds.yesterdaySpend = num;
    const yesterdayStr = getBrazilDateStr(new Date(Date.now() - 24 * 60 * 60 * 1000));
    if (!db.adSpends) db.adSpends = [];
    const idx = db.adSpends.findIndex(s => s.date === yesterdayStr);
    if (idx !== -1) {
      db.adSpends[idx].amount = num;
      db.adSpends[idx].updatedAt = new Date().toISOString();
    } else {
      db.adSpends.push({
        id: generateId('spend'),
        date: yesterdayStr,
        amount: num,
        source: 'manual',
        createdAt: new Date().toISOString()
      });
    }
  }
  if (mode) db.settings.facebookAds.mode = mode;

  // Se o modo for API, testa imediatamente a conexão e puxa o gasto real
  if (db.settings.facebookAds.mode === 'api' && db.settings.facebookAds.accountId && db.settings.facebookAds.accessToken) {
    metaApiCache.clear();
    const testResult = await fetchMetaAdSpend(db, 'hoje', null, null, true);
    if (!testResult.connected) {
      db.settings.facebookAds.connected = false;
      saveDb(db);
      return res.status(400).json({ error: `Erro na Meta API: ${testResult.error || 'Credenciais inválidas'}` });
    }

    db.settings.facebookAds.connected = true;
    saveDb(db);
    return res.json({ 
      success: true, 
      settings: {
        connected: true,
        accountId: db.settings.facebookAds.accountId,
        mode: db.settings.facebookAds.mode,
        dailySpendManual: db.settings.facebookAds.dailySpendManual,
        todaySpend: testResult.spend,
        hasToken: true,
        lastSpend: testResult.spend,
        lastSync: testResult.lastSync
      },
      liveSpendToday: testResult.spend,
      impressions: testResult.impressions,
      clicks: testResult.clicks
    });
  }

  saveDb(db);
  res.json({ success: true, settings: db.settings.facebookAds });
});

app.post('/api/facebook/sync', async (req, res) => {
  const db = getDb();
  try {
    metaApiCache.clear();
    const result = await fetchMetaAdSpend(db, 'hoje', null, null, true);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar gasto diário manual ou atualizar
app.post('/api/facebook/spend', (req, res) => {
  const db = getDb();
  const { amount, date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];
  const numericAmount = Math.max(0, Number(amount) || 0);

  if (!db.adSpends) db.adSpends = [];
  const existingIdx = db.adSpends.findIndex(s => s.date === targetDate);

  if (existingIdx !== -1) {
    db.adSpends[existingIdx].amount = numericAmount;
    db.adSpends[existingIdx].updatedAt = new Date().toISOString();
  } else {
    db.adSpends.push({
      id: generateId('spend'),
      date: targetDate,
      amount: numericAmount,
      source: 'manual',
      createdAt: new Date().toISOString()
    });
  }

  if (!db.settings.facebookAds) db.settings.facebookAds = {};
  db.settings.facebookAds.dailySpendManual = numericAmount;

  saveDb(db);
  res.json({ success: true, date: targetDate, amount: numericAmount });
});

// 8. Métricas Executivas
app.get('/api/metrics', async (req, res) => {
  const db = getDb();
  const { period = 'hoje', attendantId, whatsappId, startDate, endDate, requesterId } = req.query;

  const requester = db.users.find(u => u.id === requesterId);
  const isCeo = requester?.role === 'admin' || requester?.username === 'gustavo';

  const filteredSales = filterByPeriod(db.sales, period, startDate, endDate).filter(s => {
    if (attendantId && attendantId !== 'all' && s.attendantId !== attendantId) return false;
    if (whatsappId && whatsappId !== 'all' && s.whatsappId !== whatsappId) return false;
    return true;
  });

  const paidSales = filteredSales.filter(s => s.status === 'pago');

  // Faturamento Bruto
  const grossRevenue = paidSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const totalSalesCount = paidSales.length;
  const averageTicket = totalSalesCount > 0 ? (grossRevenue / totalSalesCount) : 0;

  // Taxas de Gateway
  const fees = db.settings.gatewayFees || { pix: 0.99, cartao_vista: 3.49, cartao_parcelado: 6.99, boleto: 2.50 };
  let estimatedGatewayFees = 0;
  paidSales.forEach(s => {
    const val = Number(s.amount) || 0;
    if (s.paymentMethod === 'pix') {
      estimatedGatewayFees += val * ((fees.pix || 0) / 100);
    } else if (s.paymentMethod === 'cartao_vista') {
      estimatedGatewayFees += val * ((fees.cartao_vista || 3.49) / 100);
    } else if (s.paymentMethod === 'cartao_parcelado') {
      estimatedGatewayFees += val * ((fees.cartao_parcelado || 6.99) / 100);
    } else if (s.paymentMethod === 'boleto') {
      estimatedGatewayFees += (fees.boleto || 2.50);
    }
  });

  const netRevenue = Math.max(0, grossRevenue - estimatedGatewayFees);

  // Comissões dos Atendentes e Baixa de Repasses (20% fixo)
  let totalCommissions = 0;
  let teamCommissionsPeriod = 0;
  let gustavoCommission = 0;
  const commissionsByAttendant = {};

  const allPayouts = db.commissionPayouts || [];
  const filteredPayouts = filterByPeriod(allPayouts, period, startDate, endDate, 'date');
  const teamPayoutsInPeriod = filteredPayouts
    .filter(p => p.attendantId !== 'user-gustavo' && p.status === 'pago')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const teamPayoutsHistorical = allPayouts
    .filter(p => p.attendantId !== 'user-gustavo' && p.status === 'pago')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  db.users.filter(u => u.active !== false).forEach(att => {
    const attSales = paidSales.filter(s => s.attendantId === att.id);
    const attGross = attSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    const rate = 20; // 20%
    const commissionVal = Math.round(attGross * (rate / 100) * 100) / 100;
    const goal = att.dailyGoal || 160.00; // Meta diária de R$ 160,00!

    const attPayoutsInPeriod = filteredPayouts.filter(p => p.attendantId === att.id && p.status === 'pago');
    const attPayoutsHistorical = allPayouts.filter(p => p.attendantId === att.id && p.status === 'pago');

    const commissionPaidInPeriod = Math.round(attPayoutsInPeriod.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) * 100) / 100;
    const commissionPaidHistorical = Math.round(attPayoutsHistorical.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) * 100) / 100;

    totalCommissions += commissionVal;
    if (att.id === 'user-gustavo') {
      gustavoCommission += commissionVal;
    } else {
      teamCommissionsPeriod += commissionVal;
    }

    const commissionPaid = (period === 'hoje' || period === 'ontem') ? commissionPaidInPeriod : commissionPaidHistorical;
    const commissionPending = Math.max(0, Math.round((commissionVal - commissionPaid) * 100) / 100);

    commissionsByAttendant[att.id] = {
      user: { 
        id: att.id, 
        name: att.name, 
        avatar: att.avatar, 
        color: att.color, 
        role: att.role, 
        title: att.title || (att.role === 'admin' ? 'CEO' : 'Atendente'),
        themeColor: att.themeColor 
      },
      salesCount: attSales.length,
      grossAmount: attGross,
      commissionRate: rate,
      commissionAmount: commissionVal,
      commissionPaid,
      commissionPending,
      payoutStatus: commissionPending <= 0.01 && commissionVal > 0 ? 'quitado' : (commissionPending > 0 ? 'pendente' : 'sem_vendas'),
      payouts: (period === 'hoje' || period === 'ontem') ? attPayoutsInPeriod : attPayoutsHistorical,
      dailyGoal: goal,
      monthlyGoal: att.monthlyGoal || 4800,
      goalProgress: goal ? Math.min(100, Math.round((attGross / goal) * 100)) : 0
    };
  });

  // Gastos com Facebook Ads / Tráfego Pago do período
  const fbResult = await fetchMetaAdSpend(db, period, startDate, endDate);
  const facebookAdSpend = fbResult.spend;
  const roas = facebookAdSpend > 0 ? (grossRevenue / facebookAdSpend) : 0;

  // Custo de arte
  const artCostPerItem = db.settings?.defaultArtCost !== undefined ? Number(db.settings.defaultArtCost) : 0;
  const totalArtCosts = totalSalesCount * artCostPerItem;

  // Custos Extras & Operacionais (IAs, Softwares, Chips, etc.)
  const filteredExpenses = filterByPeriod(db.expenses || [], period, startDate, endDate, 'date');
  const totalExpenses = Math.round(filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0) * 100) / 100;

  // Dedução da comissão de equipe a abater no lucro do período
  const teamCommissionsDeduction = teamCommissionsPeriod;

  // Lucro Líquido Real da Operação:
  // Faturamento Líquido - Comissões da Equipe - Artes - Tráfego do Período - Gastos Extras
  const netProfit = Math.round((netRevenue - teamCommissionsDeduction - totalArtCosts - facebookAdSpend - totalExpenses) * 100) / 100;
  const profitMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100) : (netProfit < 0 ? -100 : 0);

  // Quanto o Gustavo tirou / fica com ele na operação:
  // Lucro da Operação + Comissão própria de vendas do Gustavo
  const gustavoTotalTakeHome = Math.round((netProfit + gustavoCommission) * 100) / 100;

  // Ranking de Atendentes
  const ranking = Object.values(commissionsByAttendant).sort((a, b) => b.grossAmount - a.grossAmount);

  // Vendas por Linha de WhatsApp
  const salesByWhatsapp = db.whatsapps.map(wpp => {
    const wppSales = paidSales.filter(s => s.whatsappId === wpp.id);
    const wppGross = wppSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    return {
      id: wpp.id,
      name: wpp.name,
      number: wpp.number,
      color: wpp.color,
      salesCount: wppSales.length,
      grossAmount: wppGross,
      percentage: grossRevenue > 0 ? Math.round((wppGross / grossRevenue) * 100) : 0
    };
  }).sort((a, b) => b.grossAmount - a.grossAmount);

  // Profissões
  const professionMap = {};
  paidSales.forEach(s => {
    const prof = s.profession || 'Outro';
    if (!professionMap[prof]) {
      professionMap[prof] = { profession: prof, count: 0, totalAmount: 0 };
    }
    professionMap[prof].count += 1;
    professionMap[prof].totalAmount += Number(s.amount) || 0;
  });
  const topProfessions = Object.values(professionMap).sort((a, b) => b.totalAmount - a.totalAmount);

  // Formas de Pagamento
  const paymentMap = {
    pix: { label: 'PIX', count: 0, amount: 0, color: '#10B981' },
    cartao_vista: { label: 'Cartão 1x', count: 0, amount: 0, color: '#3B82F6' },
    cartao_parcelado: { label: 'Cartão Parcelado', count: 0, amount: 0, color: '#8B5CF6' },
    boleto: { label: 'Boleto', count: 0, amount: 0, color: '#F59E0B' }
  };
  paidSales.forEach(s => {
    const method = s.paymentMethod || 'pix';
    if (paymentMap[method]) {
      paymentMap[method].count += 1;
      paymentMap[method].amount += Number(s.amount) || 0;
    }
  });

  const pendingFollowups = (db.followUps || []).filter(f => f.status === 'pendente').length;

  if (!isCeo) {
    return res.json({
      period,
      ranking,
      commissionsByAttendant,
      pendingFollowups,
      isCeo: false
    });
  }

  res.json({
    period,
    grossRevenue,
    netRevenue,
    estimatedGatewayFees,
    totalCommissions,
    teamCommissionsPeriod,
    teamCommissionsPaid: (period === 'hoje' || period === 'ontem') ? teamPayoutsInPeriod : teamPayoutsHistorical,
    teamCommissionsPending: Math.max(0, teamCommissionsPeriod - ((period === 'hoje' || period === 'ontem') ? teamPayoutsInPeriod : teamPayoutsHistorical)),
    gustavoCommission,
    gustavoTotalTakeHome,
    companyProfitAfterCeoCommission: netProfit,
    totalArtCosts,
    facebookAdSpend,
    facebookAdSpendPeriod: fbResult.spendPeriod || 2325.14,
    facebookAdSpendToday: fbResult.spendToday || Number(db.settings?.facebookAds?.dailySpendManual) || 60,
    facebookAdsMeta: fbResult,
    totalExpenses,
    expenses: filteredExpenses,
    payouts: (period === 'hoje' || period === 'ontem') ? filteredPayouts : allPayouts,
    roas,
    netProfit,
    profitMargin,
    totalSalesCount,
    averageTicket,
    pendingFollowups,
    ranking,
    commissionsByAttendant,
    salesByWhatsapp,
    topProfessions,
    paymentDistribution: Object.values(paymentMap),
    isCeo: true
  });
});

// Fallback SPA
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('X1 CRM API Server está rodando.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Caricatura CRM Server rodando em http://0.0.0.0:${PORT}`);
});