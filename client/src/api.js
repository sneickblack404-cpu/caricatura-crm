export const API_BASE = typeof window !== 'undefined' && localStorage.getItem('crm_custom_api_url')
  ? localStorage.getItem('crm_custom_api_url')
  : 'https://iciness-suitor-thirsting.ngrok-free.dev/api';

export const defaultHeaders = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  'bypass-tunnel-reminder': 'true',
  'Bypass-Tunnel-Reminder': 'true'
};

export const api = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        username: username.trim(),
        password: password.trim()
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Credenciais inválidas');
    }
    return data;
  },

  // Bootstrap & Settings
  async getBootstrap() {
    const res = await fetch(`${API_BASE}/bootstrap`, { headers: defaultHeaders });
    return res.json();
  },
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`, { headers: defaultHeaders });
    return res.json();
  },
  async updateSettings(settings) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Users / Attendants
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`, { headers: defaultHeaders });
    return res.json();
  },
  async createUser(user) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(user)
    });
    return res.json();
  },
  async updateUser(id, user) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(user)
    });
    return res.json();
  },

  // WhatsApp Lines
  async getWhatsapps() {
    const res = await fetch(`${API_BASE}/whatsapps`, { headers: defaultHeaders });
    return res.json();
  },
  async createWhatsapp(data) {
    const res = await fetch(`${API_BASE}/whatsapps`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateWhatsapp(id, data) {
    const res = await fetch(`${API_BASE}/whatsapps/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteWhatsapp(id) {
    const res = await fetch(`${API_BASE}/whatsapps/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders
    });
    return res.json();
  },

  // Sales
  async getSales(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/sales?${query}`, { headers: defaultHeaders });
    return res.json();
  },
  async createSale(sale) {
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(sale)
    });
    return res.json();
  },
  async deleteSale(id) {
    const res = await fetch(`${API_BASE}/sales/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders
    });
    return res.json();
  },
  async updateSale(id, sale) {
    const res = await fetch(`${API_BASE}/sales/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(sale)
    });
    return res.json();
  },

  // Follow-ups
  async getFollowups(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/followups?${query}`, { headers: defaultHeaders });
    return res.json();
  },
  async createFollowup(data) {
    const res = await fetch(`${API_BASE}/followups`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateFollowup(id, data) {
    const res = await fetch(`${API_BASE}/followups/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteFollowup(id) {
    const res = await fetch(`${API_BASE}/followups/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders
    });
    return res.json();
  },

  // Metrics
  async getMetrics(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/metrics?${query}`, { headers: defaultHeaders });
    return res.json();
  },

  // Facebook Ads Config & Sync
  async getFacebookConfig() {
    const res = await fetch(`${API_BASE}/facebook/config`, { headers: defaultHeaders });
    return res.json();
  },
  async updateFacebookConfig(data) {
    const res = await fetch(`${API_BASE}/facebook/config`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async syncFacebookSpend() {
    const res = await fetch(`${API_BASE}/facebook/sync`, { 
      method: 'POST',
      headers: defaultHeaders 
    });
    return res.json();
  },
  async recordFacebookDailySpend(amount, date) {
    const res = await fetch(`${API_BASE}/facebook/spend`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ amount, date })
    });
    return res.json();
  },

  // Operational Expenses & AI Costs
  async getExpenses(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/expenses?${query}`, { headers: defaultHeaders });
    return res.json();
  },
  async createExpense(data) {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateExpense(id, data) {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteExpense(id) {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders
    });
    return res.json();
  },

  // Commission Payouts (Baixa de Comissões)
  async getPayouts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/payouts?${query}`, { headers: defaultHeaders });
    return res.json();
  },
  async createPayout(data) {
    const res = await fetch(`${API_BASE}/payouts`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deletePayout(id) {
    const res = await fetch(`${API_BASE}/payouts/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders
    });
    return res.json();
  }
};

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

export function formatPhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('55') && clean.length > 11) {
    clean = clean.slice(2);
  }
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone;
}