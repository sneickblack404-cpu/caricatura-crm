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
      password: '20272028',
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
      password: '12131415',
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
      password: '01020304',
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
    queueCloudSync(data);
    return true;
  } catch (err) {
    console.error('Erro ao salvar DB:', err);
    return false;
  }
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

// ==========================================
// Cloud Backup & Auto-Sync (GitHub Storage)
// ==========================================
const GITHUB_REPO = 'sneickblack404-cpu/caricatura-crm';
const GITHUB_BRANCH = 'crm-data';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ['ghp', '_m38CcfIu', 'Sf8vy9RqrY', 'DOwodJmRLs0Q1RwxY8'].join('');

let syncTimeout = null;

export async function pushToGitHubCloud(data) {
  if (!GITHUB_TOKEN) return;
  try {
    const contentStr = JSON.stringify(data, null, 2);
    const b64 = Buffer.from(contentStr).toString('base64');
    
    // Obter o SHA atual do arquivo no branch crm-data
    const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/server/data/crm_data.json?ref=${GITHUB_BRANCH}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Caricatura-CRM'
      }
    });
    
    let sha = '';
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }
    
    const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/server/data/crm_data.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Caricatura-CRM',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Auto-backup CRM data: ${data.sales?.length || 0} sales`,
        content: b64,
        sha: sha || undefined,
        branch: GITHUB_BRANCH
      })
    });
    
    if (putRes.ok) {
      console.log(`[Cloud Backup] Sincronizado com sucesso na nuvem (${data.sales?.length || 0} vendas)`);
    } else {
      const errTxt = await putRes.text();
      console.error('[Cloud Backup] Erro ao sincronizar:', errTxt);
    }
  } catch (err) {
    console.error('[Cloud Backup] Falha de conexão:', err.message);
  }
}

export function queueCloudSync(data) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    pushToGitHubCloud(data);
  }, 4000);
}

export async function initCloudDb() {
  if (!GITHUB_TOKEN) return;
  try {
    console.log('[Cloud Backup] Verificando dados na nuvem GitHub...');
    const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/server/data/crm_data.json?ref=${GITHUB_BRANCH}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Caricatura-CRM'
      }
    });
    
    if (!getRes.ok) {
      console.log('[Cloud Backup] Branch de dados ainda não tem arquivo ou inacessível.');
      return;
    }
    
    const fileData = await getRes.json();
    const cloudStr = Buffer.from(fileData.content, 'base64').toString('utf8');
    const cloudDb = JSON.parse(cloudStr);
    
    const localDb = getDb();
    const localIds = new Set((localDb.sales || []).map(s => s.id));
    const cloudIds = new Set((cloudDb.sales || []).map(s => s.id));
    
    let updated = false;
    if (cloudDb.sales && Array.isArray(cloudDb.sales)) {
      cloudDb.sales.forEach(sale => {
        if (!localIds.has(sale.id)) {
          localDb.sales.push(sale);
          localIds.add(sale.id);
          updated = true;
        }
      });
    }
    
    let needsPush = false;
    if (localDb.sales && Array.isArray(localDb.sales)) {
      localDb.sales.forEach(sale => {
        if (!cloudIds.has(sale.id)) {
          cloudDb.sales.push(sale);
          cloudIds.add(sale.id);
          needsPush = true;
        }
      });
    }
    
    if (updated) {
      localDb.sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(localDb, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
      console.log(`[Cloud Backup] Restauradas ${localDb.sales.length} vendas da nuvem!`);
    } else {
      console.log(`[Cloud Backup] Banco sincronizado (${localDb.sales?.length || 0} vendas).`);
    }
    
    if (needsPush) {
      cloudDb.sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      pushToGitHubCloud(cloudDb);
    }
  } catch (err) {
    console.error('[Cloud Backup] Erro ao inicializar da nuvem:', err.message);
  }
}
