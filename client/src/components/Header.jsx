import React from 'react';
import { Calendar, Plus, Phone, Palette } from 'lucide-react';

const ACCENT_COLORS = [
  { id: 'amarelo', name: 'Amarelo', hex: '#f5b800' },
  { id: 'azul', name: 'Azul', hex: '#3b82f6' },
  { id: 'verde', name: 'Verde', hex: '#10b981' },
  { id: 'rosa', name: 'Rosa', hex: '#ec4899' },
];

export default function Header({ 
  currentTab, 
  period, 
  setPeriod, 
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  onSetCustomDates,
  isRefreshing = false,
  whatsappFilter, 
  setWhatsappFilter, 
  whatsapps = [],
  onOpenSaleModal,
  currentUser,
  accentColor = 'amarelo',
  onSelectAccent,
  onOpenExpenseModal
}) {
  const periodOptions = [
    { id: 'hoje', label: 'Hoje' },
    { id: 'ontem', label: 'Ontem' },
    { id: '7d', label: '7 dias' },
    { id: '15d', label: '15 dias' },
    { id: '30d', label: '30 dias' },
    { id: 'este_mes', label: 'Este mês' },
    { id: 'mes_passado', label: 'Mês passado' },
    { id: '3_meses', label: '3 meses' },
    { id: 'ano', label: 'Este ano' },
  ];

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Dashboard';
      case 'vendas': return 'Histórico de Vendas';
      case 'whatsapps': return 'Gestão de Linhas do WhatsApp';
      case 'equipe': return 'Equipe & Atendentes';
      case 'metricas': return 'Métricas Executivas & Lucro Real';
      case 'followups': return 'Follow-ups & Retornos';
      default: return 'Painel';
    }
  };

  return (
    <header className="bg-[#111218] border-b border-[#20222f] px-6 py-4">
      {/* Top row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">{getTabTitle()}</h1>
            <span className="text-xs text-gray-400 capitalize bg-[#181a24] px-2.5 py-1 rounded-md border border-[#272938]">
              {dateFormatted}
            </span>
          </div>
        </div>

        {/* Action Button & User Controls */}
        <div className="flex items-center gap-3">
          {/* Seletor Rápido de Cor de Destaque (Amarelo, Azul, Verde, Rosa) */}
          <div className="flex items-center gap-1.5 bg-[#181a24] border border-[#272938] rounded-xl px-2.5 py-1.5">
            <Palette className="w-3.5 h-3.5 text-gray-400 mr-0.5" />
            {ACCENT_COLORS.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => onSelectAccent && onSelectAccent(col.id)}
                title={`Cor ${col.name}`}
                className={`w-4 h-4 rounded-full transition-transform ${
                  accentColor === col.id 
                    ? 'ring-2 ring-white scale-125 shadow-sm' 
                    : 'opacity-60 hover:opacity-100 hover:scale-110'
                }`}
                style={{ backgroundColor: col.hex }}
              />
            ))}
          </div>

          {/* Quick WhatsApp filter */}
          <div className="flex items-center bg-[#181a24] border border-[#272938] rounded-xl px-2.5 py-1.5">
            <Phone className="w-3.5 h-3.5 text-[#10B981] mr-2" />
            <select
              value={whatsappFilter}
              onChange={(e) => setWhatsappFilter(e.target.value)}
              className="bg-transparent text-xs focus:outline-none cursor-pointer font-medium text-gray-200"
            >
              <option value="all">Todos os Zaps ({whatsapps.length})</option>
              {whatsapps.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold text-xs px-3.5 py-2 rounded-xl transition active:scale-95 shadow-sm"
            title="Cadastrar gastos manuais com IAs, chips, softwares e custos operacionais"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400 stroke-[3]" />
            <span>Registrar Gasto à Parte</span>
          </button>

          <button
            onClick={onOpenSaleModal}
            className="flex items-center gap-2 bg-brand font-black text-sm px-4 py-2 rounded-xl shadow-lg transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Venda</span>
          </button>
        </div>
      </div>

      {/* Period Filter Pills */}
      <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
        {periodOptions.map((opt) => {
          const isActive = period === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-brand shadow-sm font-black'
                  : 'bg-[#181a24] text-gray-400 hover:text-gray-100 hover:bg-[#20222f] border border-[#272938]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        {/* Botão de Personalizar Data */}
        <button
          type="button"
          onClick={() => setPeriod('personalizado')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            period === 'personalizado'
              ? 'bg-brand shadow-sm font-black text-black'
              : 'bg-[#181a24] text-gray-400 hover:text-gray-100 hover:bg-[#20222f] border border-[#272938]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {period === 'personalizado' && customStartDate
              ? (customStartDate === customEndDate
                  ? `Dia ${customStartDate.split('-').reverse().slice(0, 2).join('/')}`
                  : `${customStartDate.split('-').reverse().slice(0, 2).join('/')} a ${customEndDate.split('-').reverse().slice(0, 2).join('/')}`)
              : '📅 Personalizar Data'}
          </span>
        </button>
      </div>

      {/* Barra de Data Personalizada (De / Até / Dia Específico) */}
      {period === 'personalizado' && (
        <div className="mt-3 pt-3 border-t border-[#1e202c] flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-blue-300 font-bold bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Filtrar Período:</span>
          </div>

          <div className="flex items-center gap-1 bg-[#181a24] border border-[#272938] px-2.5 py-1 rounded-lg">
            <span className="text-[11px] text-gray-400 font-semibold uppercase">De:</span>
            <input
              type="date"
              value={customStartDate || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (onSetCustomDates) {
                  const end = (!customEndDate || customEndDate < val) ? val : customEndDate;
                  onSetCustomDates(val, end);
                } else if (setCustomStartDate) {
                  setCustomStartDate(val);
                }
              }}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#181a24] border border-[#272938] px-2.5 py-1 rounded-lg">
            <span className="text-[11px] text-gray-400 font-semibold uppercase">Até:</span>
            <input
              type="date"
              value={customEndDate || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (onSetCustomDates) {
                  onSetCustomDates(customStartDate || val, val);
                } else if (setCustomEndDate) {
                  setCustomEndDate(val);
                }
              }}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            />
          </div>

          {/* Atalhos Rápidos para 1 dia específico ou recente */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const val = customStartDate || new Date().toISOString().split('T')[0];
                if (onSetCustomDates) {
                  onSetCustomDates(val, val);
                } else {
                  if (setCustomStartDate) setCustomStartDate(val);
                  if (setCustomEndDate) setCustomEndDate(val);
                }
              }}
              className="px-2.5 py-1.5 bg-[#202334] hover:bg-[#2b2f46] text-blue-300 rounded-lg text-xs font-semibold transition border border-blue-500/30"
              title="Filtrar exatamente apenas a data selecionada no campo 'De'"
            >
              🎯 Apenas este dia
            </button>

            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const yest = new Date(now);
                yest.setDate(now.getDate() - 1);
                const yestStr = yest.toISOString().split('T')[0];
                if (onSetCustomDates) {
                  onSetCustomDates(yestStr, yestStr);
                } else {
                  if (setCustomStartDate) setCustomStartDate(yestStr);
                  if (setCustomEndDate) setCustomEndDate(yestStr);
                }
              }}
              className="px-2.5 py-1.5 bg-[#181a24] hover:bg-[#20222f] text-gray-300 rounded-lg text-xs font-semibold transition border border-[#272938]"
            >
              Ontem
            </button>

            <button
              type="button"
              onClick={() => {
                const todayStr = new Date().toISOString().split('T')[0];
                if (onSetCustomDates) {
                  onSetCustomDates(todayStr, todayStr);
                } else {
                  if (setCustomStartDate) setCustomStartDate(todayStr);
                  if (setCustomEndDate) setCustomEndDate(todayStr);
                }
              }}
              className="px-2.5 py-1.5 bg-[#181a24] hover:bg-[#20222f] text-gray-300 rounded-lg text-xs font-semibold transition border border-[#272938]"
            >
              Hoje
            </button>

            {isRefreshing && (
              <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 animate-pulse ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>Buscando dia...</span>
              </span>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
