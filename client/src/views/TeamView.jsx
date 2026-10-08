import React, { useState } from 'react';
import { Users, Plus, Award, Target, Percent, Phone, ShieldCheck, Edit2 } from 'lucide-react';
import { api, formatCurrency, formatPhone } from '../api';

export default function TeamView({ users = [], onReload, metrics }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState('20');
  const [dailyGoal, setDailyGoal] = useState('160');
  const [monthlyGoal, setMonthlyGoal] = useState('4800');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const attendants = users.filter(u => u.role === 'attendant');
  const adminUser = users.find(u => u.role === 'admin');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor, informe o nome do atendente.');
      return;
    }

    setLoading(true);
    try {
      await api.createUser({
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        role: 'attendant',
        commissionRate: Number(commissionRate) || 20,
        dailyGoal: Number(dailyGoal) || 160,
        monthlyGoal: Number(monthlyGoal) || 4800
      });

      setName('');
      setPhone('');
      setIsModalOpen(false);
      onReload();
    } catch (err) {
      console.error(err);
      setError('Erro ao cadastrar atendente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151720] border border-[#272938] rounded-2xl p-6 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-[#f5b800]" />
            <span className="text-xs font-bold text-[#f5b800] uppercase tracking-wider">Equipe de Vendas</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Gestão de Atendentes & Comissões
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Cadastre os vendedores, defina suas metas individuais e percentuais de comissão.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#f5b800] hover:bg-[#e0a700] text-black font-extrabold text-sm px-5 py-3 rounded-xl shadow-lg shadow-yellow-500/20 transition shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Novo Atendente</span>
        </button>
      </div>

      {/* Cards de Atendentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {attendants.map((att) => {
          const attMetrics = metrics?.commissionsByAttendant?.[att.id];
          const gross = attMetrics?.grossAmount || 0;
          const commissionVal = attMetrics?.commissionAmount || 0;
          const salesCount = attMetrics?.salesCount || 0;

          return (
            <div
              key={att.id}
              className="bg-[#151720] border border-[#272938] hover:border-[#383d54] rounded-2xl p-5 shadow-lg flex flex-col justify-between transition"
            >
              <div>
                {/* Header Atendente */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-md text-base"
                      style={{ backgroundColor: att.color || '#3B82F6' }}
                    >
                      {att.avatar || att.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">{att.name}</h4>
                      <p className="text-xs text-gray-400">Atendente / Vendedor</p>
                    </div>
                  </div>

                  <span className="bg-[#8B5CF6]/15 text-[#a78bfa] text-xs font-black px-2.5 py-1 rounded-lg border border-[#8B5CF6]/30">
                    {att.commissionRate}% Comis.
                  </span>
                </div>

                {/* Metas & Contato */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs bg-[#181a24] p-2.5 rounded-xl border border-[#252837]">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-rose-500" />
                      Meta Diária:
                    </span>
                    <span className="font-bold text-gray-200">{formatCurrency(att.dailyGoal || 160)}</span>
                  </div>

                  {att.phone && (
                    <div className="flex items-center justify-between text-xs bg-[#181a24] p-2.5 rounded-xl border border-[#252837]">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        WhatsApp:
                      </span>
                      <span className="font-semibold text-gray-300">{formatPhone(att.phone)}</span>
                    </div>
                  )}
                </div>

                {/* Estatísticas no período */}
                <div className="grid grid-cols-2 gap-2 bg-[#12131b] p-3 rounded-xl border border-[#20222e]">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Vendas no Período</span>
                    <span className="text-sm font-black text-white">{salesCount} caricaturas</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Comissão a Receber</span>
                    <span className="text-sm font-black text-[#a78bfa]">{formatCurrency(commissionVal)}</span>
                  </div>
                </div>
              </div>

              {/* Rodapé Total Faturado */}
              <div className="mt-4 pt-3 border-t border-[#20222f] flex items-center justify-between text-xs">
                <span className="text-gray-400">Total Faturado:</span>
                <span className="font-black text-[#f5b800] text-sm">{formatCurrency(gross)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Atendente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#151720] border border-[#272938] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#f5b800] text-black flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Cadastrar Novo Atendente</h3>
                  <p className="text-xs text-gray-400">Defina o perfil e as metas de vendas</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Beatriz Lima"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  WhatsApp Pessoal do Atendente
                </label>
                <input
                  type="text"
                  placeholder="Ex: (11) 98888-7777"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Taxa de Comissão (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    required
                    className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Meta Diária (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    required
                    className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f5b800] hover:bg-[#e0a700] text-black font-extrabold text-sm py-2.5 rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Atendente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
