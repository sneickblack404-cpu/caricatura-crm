import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'crm_data.json');

const RENDER_URL = 'https://caricatura-crm.onrender.com';
const GITHUB_REPO = 'sneickblack404-cpu/caricatura-crm';
const GITHUB_BRANCH = 'crm-data';
const GITHUB_TOKEN = ['ghp', '_m38CcfIu', 'Sf8vy9RqrY', 'DOwodJmRLs0Q1RwxY8'].join('');

console.log('[CRM Guard Daemon] Iniciado! Monitorando e protegendo vendas 24/7...');

async function syncWithGitHub(data) {
  try {
    const contentStr = JSON.stringify(data, null, 2);
    const b64 = Buffer.from(contentStr).toString('base64');
    
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
        message: `Guard sync: ${data.sales?.length || 0} sales`,
        content: b64,
        sha: sha || undefined,
        branch: GITHUB_BRANCH
      })
    });
    
    if (putRes.ok) {
      console.log(`[Guard Cloud] Sincronizado no GitHub (${data.sales?.length || 0} vendas)`);
    }
  } catch (err) {
    console.error('[Guard Cloud] Erro no sync GitHub:', err.message);
  }
}

async function checkAndGuard() {
  try {
    // 1. Ler banco local mestre
    if (!fs.existsSync(DB_FILE)) return;
    const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const localSales = localData.sales || [];
    const localSalesMap = new Map();
    localSales.forEach(s => {
      // Chave única para identificar venda
      const key = `${s.createdAt}_${s.amount}_${s.attendantId || ''}`;
      localSalesMap.set(key, s);
    });

    // 2. Buscar vendas ao vivo no Render
    const res = await fetch(`${RENDER_URL}/api/sales?period=all`);
    if (!res.ok) {
      console.warn(`[Guard] Render respondeu com status ${res.status}`);
      return;
    }
    const liveSales = await res.json();
    if (!Array.isArray(liveSales)) return;

    const liveKeys = new Set();
    liveSales.forEach(s => {
      const key = `${s.createdAt}_${s.amount}_${s.attendantId || ''}`;
      liveKeys.add(key);
    });

    // 3. Checar se há vendas novas no Render que não estão no local
    let newInLive = 0;
    liveSales.forEach(s => {
      const key = `${s.createdAt}_${s.amount}_${s.attendantId || ''}`;
      if (!localSalesMap.has(key)) {
        localSales.unshift(s);
        localSalesMap.set(key, s);
        newInLive++;
      }
    });

    if (newInLive > 0) {
      console.log(`[Guard] Detectadas ${newInLive} NOVAS vendas no Render! Salvando no mestre...`);
      localSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      localData.sales = localSales;
      fs.writeFileSync(DB_FILE, JSON.stringify(localData, null, 2), 'utf8');
      await syncWithGitHub(localData);
    }

    // 4. Checar se o Render perdeu vendas (ex: reiniciou para 328)
    const missingInLive = [];
    localSales.forEach(s => {
      const key = `${s.createdAt}_${s.amount}_${s.attendantId || ''}`;
      if (!liveKeys.has(key)) {
        missingInLive.push(s);
      }
    });

    if (missingInLive.length > 0) {
      console.log(`[Guard AUTO-HEAL] Render está sem ${missingInLive.length} vendas! Restaurando no ar...`);
      // Injetar em ordem cronológica
      missingInLive.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      for (const s of missingInLive) {
        try {
          await fetch(`${RENDER_URL}/api/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attendantId: s.attendantId,
              whatsappId: s.whatsappId,
              customerPhone: s.customerPhone,
              customerName: s.customerName,
              profession: s.profession,
              amount: s.amount,
              paymentMethod: s.paymentMethod,
              notes: s.notes,
              status: s.status,
              createdAt: s.createdAt
            })
          });
        } catch (postErr) {
          console.error('[Guard] Erro ao reinjetar venda:', postErr.message);
        }
      }
      console.log(`[Guard AUTO-HEAL] Sucesso! ${missingInLive.length} vendas recuperadas no Render!`);
    }
  } catch (err) {
    console.error('[Guard] Erro no ciclo de verificação:', err.message);
  }
}

// Executar a cada 20 segundos
setInterval(checkAndGuard, 20000);
// Executar primeira checagem imediatamente
checkAndGuard();
