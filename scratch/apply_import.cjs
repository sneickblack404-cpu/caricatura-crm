const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../server/data/crm_data.json');
const generatedSalesPath = path.join(__dirname, 'generated_sales.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const sales = JSON.parse(fs.readFileSync(generatedSalesPath, 'utf8'));

db.sales = sales;

// Adicionar despesas operacionais iniciais identificadas no extrato
if (!db.expenses || db.expenses.length === 0) {
  db.expenses = [
    {
      id: 'exp-pjbank-01',
      title: 'PJBANK - Tarifas & Intermediação Bancária',
      amount: 147.00,
      category: 'software',
      date: '2026-09-25',
      notes: 'Débito em conta extrato PicPay 25/09',
      createdAt: '2026-09-25T08:32:00.000Z'
    },
    {
      id: 'exp-ia-01',
      title: 'Assinatura Ferramentas de IA (Midjourney / ChatGPT Plus)',
      amount: 150.00,
      category: 'ia',
      date: '2026-09-15',
      notes: 'Geração e aprimoramento de caricaturas com IA',
      createdAt: '2026-09-15T10:00:00.000Z'
    },
    {
      id: 'exp-transp-01',
      title: 'Recargas & Transporte Operacional',
      amount: 52.00,
      category: 'outro',
      date: '2026-09-09',
      notes: 'Recargas cartão transporte extrato PicPay (R$ 20,80 + R$ 31,20)',
      createdAt: '2026-09-09T07:12:00.000Z'
    }
  ];
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully updated crm_data.json with', db.sales.length, 'sales and', db.expenses.length, 'expenses.');
