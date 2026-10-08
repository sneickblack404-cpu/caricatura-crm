import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'crm_data.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DEFAULT_DATA = {
  settings: {
    businessName: 'X1 CRM Caricaturas',
    defaultCommissionRate: 20, // 20% para todos
    gatewayFees: {
      pix: 0.99,
      cartao_vista: 3.49,
      cartao_parcelado: 6.99,
      boleto: 2.50
    },
    defaultArtCost: 20,
    facebookAds: {
      connected: false,
      accountId: '',
      accessToken: '',
      dailySpendManual: 50.00, // Gasto padrão diário se não usar API
      mode: 'manual' // 'manual' ou 'api'
    }
  },
  adSpends: [
    // Histórico de gastos diários de tráfego pago
  ],
  whatsapps: [
    {
      id: 'wpp-1',
      name: '+55 27 99245-6099',
      number: '5527992456099',
      color: '#10B981',
      description: 'Linha WhatsApp +55 27 99245-6099',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'wpp-2',
      name: '+55 27 99256-4791',
      number: '5527992564791',
      color: '#3B82F6',
      description: 'Linha WhatsApp +55 27 99256-4791',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'wpp-3',
      name: 'Tráfego Direto',
      number: '',
      color: '#F59E0B',
      description: 'Venda de Tráfego Direto (Sem WhatsApp)',
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  users: [
    {
      id: 'user-gustavo',
      username: 'gustavo',
      password: '33734023',
      name: 'Gustavo Henrick',
      title: 'CEO',
      role: 'admin',
      avatar: 'G',
      color: '#f5b800',
      themeColor: 'amarelo',
      commissionRate: 20,
      dailyGoal: 160.00, // Meta diária de R$ 160,00!
      monthlyGoal: 4800.00,
      active: true
    },
    {
      id: 'user-luis',
      username: 'luis',
      password: '1234',
      name: 'Luis Henrique',
      title: 'Atendente',
      role: 'attendant',
      avatar: 'L',
      color: '#10B981',
      themeColor: 'verde',
      phone: '',
      commissionRate: 20,
      dailyGoal: 160.00, // Meta diária de R$ 160,00!
      monthlyGoal: 4800.00,
      active: true
    },
    {
      id: 'user-david',
      username: 'david',
      password: '1234',
      name: 'David Marques',
      title: 'Atendente',
      role: 'attendant',
      avatar: 'D',
      color: '#3B82F6',
      themeColor: 'azul',
      phone: '',
      commissionRate: 20,
      dailyGoal: 160.00, // Meta diária de R$ 160,00!
      monthlyGoal: 4800.00,
      active: true
    },
    {
      id: 'user-guilherme',
      username: 'guilherme',
      password: '1234',
      name: 'Guilherme',
      title: 'Atendente',
      role: 'attendant',
      avatar: 'G',
      color: '#EC4899',
      themeColor: 'rosa',
      phone: '',
      commissionRate: 20,
      dailyGoal: 160.00, // Meta diária de R$ 160,00!
      monthlyGoal: 4800.00,
      active: true
    }
  ],
  sales: [],
  followUps: []
};

// Carregar ou inicializar banco
export function getDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
      return DEFAULT_DATA;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    // Garantir que campos novos existam
    if (!parsed.adSpends) parsed.adSpends = [];
    if (!parsed.settings.facebookAds) {
      parsed.settings.facebookAds = DEFAULT_DATA.settings.facebookAds;
    }
    return parsed;
  } catch (err) {
    console.error('Erro ao ler DB:', err);
    return DEFAULT_DATA;
  }
}

// Salvar dados atomicamente
export function saveDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Erro ao salvar DB:', err);
    return false;
  }
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}
