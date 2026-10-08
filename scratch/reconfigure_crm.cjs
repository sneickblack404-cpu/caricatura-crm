const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../server/data/crm_data.json');
const rawDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const origSales = JSON.parse(fs.readFileSync(path.join(__dirname, 'generated_sales.json'), 'utf8'));

// 1. Reconfiguração das Vendas
// Luis Henrique: 1 venda de R$ 255,25
// David Marques: 1 venda de R$ 1.120,00
// Gustavo Henrick: restante somando exatamente R$ 3.391,11
// Total: 241 vendas = R$ 4.766,36

const targetGustavo = 3391.11;
const gustavoSales = origSales.slice(0, 239).map((s, idx) => ({
  ...s,
  id: `sale-gustavo-${String(idx + 1).padStart(4, '0')}`,
  attendantId: 'user-gustavo',
  attendantName: 'Gustavo Henrick'
}));

const gustavoSubtotal = gustavoSales.reduce((a, s) => a + s.amount, 0);
const ratio = targetGustavo / gustavoSubtotal;
let running = 0;

gustavoSales.forEach((s, idx) => {
  if (idx === gustavoSales.length - 1) {
    s.amount = Math.round((targetGustavo - running) * 100) / 100;
  } else {
    const scaled = Math.round(s.amount * ratio * 100) / 100;
    s.amount = scaled;
    running += scaled;
  }
});

const luisSale = {
  id: 'sale-luis-0001',
  attendantId: 'user-luis',
  attendantName: 'Luis Henrique',
  whatsappId: 'wpp-1',
  whatsappName: 'WhatsApp 01 - Comercial Principal',
  customerName: 'Cliente Luis Henrique (Pedido Especial)',
  customerPhone: '5511998761234',
  profession: 'Empresarial / Encomenda',
  amount: 255.25,
  paymentMethod: 'pix',
  notes: 'Venda realizada por Luis Henrique. Comissão de 20% (R$ 51,05) quitada via Pix hoje.',
  status: 'pago',
  createdAt: '2026-09-29T10:00:00.000Z'
};

const davidSale = {
  id: 'sale-david-0001',
  attendantId: 'user-david',
  attendantName: 'David Marques',
  whatsappId: 'wpp-2',
  whatsappName: 'WhatsApp 02 - Tráfego Pago / Anúncios',
  customerName: 'Cliente David Marques (Lote Corporativo)',
  customerPhone: '5511987654321',
  profession: 'Corporativo / Eventos',
  amount: 1120.00,
  paymentMethod: 'pix',
  notes: 'Venda realizada por David Marques. Comissão de 20% (R$ 224,00) quitada via Pix hoje.',
  status: 'pago',
  createdAt: '2026-09-29T11:00:00.000Z'
};

const allSales = [luisSale, davidSale, ...gustavoSales];

// 2. Tráfego Meta Ads
if (!rawDb.settings.facebookAds) rawDb.settings.facebookAds = {};
rawDb.settings.facebookAds.lastSpend = 2325.14; // Acumulado no período
rawDb.settings.facebookAds.todaySpend = 58.01;  // Parcial de hoje

// Atualiza / insere adSpends
if (!rawDb.adSpends) rawDb.adSpends = [];
const todayStr = '2026-09-29';
const existingTodayIdx = rawDb.adSpends.findIndex(s => s.date === todayStr);
if (existingTodayIdx !== -1) {
  rawDb.adSpends[existingTodayIdx].amount = 58.01;
  rawDb.adSpends[existingTodayIdx].source = 'meta_api';
} else {
  rawDb.adSpends.push({
    id: 'spend-today-20260929',
    date: todayStr,
    amount: 58.01,
    source: 'meta_api',
    createdAt: new Date().toISOString()
  });
}

// 3. Baixa de Comissões (Extrato de Repasses)
rawDb.commissionPayouts = [
  {
    id: 'payout-luis-001',
    attendantId: 'user-luis',
    attendantName: 'Luis Henrique',
    amount: 51.05,
    grossSaleRef: 255.25,
    rate: 20,
    paymentMethod: 'pix',
    status: 'pago',
    paidAt: '2026-09-29T16:00:00.000Z',
    referencePeriod: 'Setembro/2026',
    notes: 'Quitação integral de comissão de 20% sobre venda de R$ 255,25 realizada e paga hoje via Pix'
  },
  {
    id: 'payout-david-001',
    attendantId: 'user-david',
    attendantName: 'David Marques',
    amount: 224.00,
    grossSaleRef: 1120.00,
    rate: 20,
    paymentMethod: 'pix',
    status: 'pago',
    paidAt: '2026-09-29T16:05:00.000Z',
    referencePeriod: 'Setembro/2026',
    notes: 'Quitação integral de comissão de 20% sobre venda de R$ 1.120,00 realizada e paga hoje via Pix'
  }
];

// Salva vendas reconfiguradas
rawDb.sales = allSales;

fs.writeFileSync(dbPath, JSON.stringify(rawDb, null, 2), 'utf8');

console.log('CRM Database reconfigured successfully:');
console.log('- Total sales:', allSales.length);
console.log('- Total gross:', allSales.reduce((a, s) => a + s.amount, 0));
console.log('- Luis:', allSales.filter(s => s.attendantId === 'user-luis').length, 'venda(s), R$', allSales.filter(s => s.attendantId === 'user-luis').reduce((a, s) => a + s.amount, 0));
console.log('- David:', allSales.filter(s => s.attendantId === 'user-david').length, 'venda(s), R$', allSales.filter(s => s.attendantId === 'user-david').reduce((a, s) => a + s.amount, 0));
console.log('- Gustavo:', allSales.filter(s => s.attendantId === 'user-gustavo').length, 'venda(s), R$', allSales.filter(s => s.attendantId === 'user-gustavo').reduce((a, s) => a + s.amount, 0));
console.log('- Commission Payouts registered:', rawDb.commissionPayouts.length);
console.log('- Meta Ads period spend:', rawDb.settings.facebookAds.lastSpend, '| Today spend:', rawDb.settings.facebookAds.todaySpend);
