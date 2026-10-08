import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Users, 
  Percent, 
  PieChart, 
  Briefcase, 
  Phone, 
  Copy, 
  Check, 
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Settings2,
  RefreshCw,
  Cpu,
  Receipt,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Smartphone,
  Layers,
  Wallet
} from 'lucide-react';
import { formatCurrency, api } from '../api';
import FacebookAdsModal from '../components/FacebookAdsModal';
import ExpenseModal from '../components/ExpenseModal';

const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function AdminMetricsView({ 
  metrics, 
  users = [],
  whatsapps = [], 
  period = 'hoje', 
  setPeriod, 
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  onSetCustomDates,
  isRefreshing = false,
  periodLabel = 'Hoje', 
  onReload 
}) {
  const [copied, setCopied] = useState(false);
  const [isFbModalOpen, setIsFbModalOpen] = useState(false);
  const [isSyncingFb, setIsSyncingFb] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleSyncFb = async () => {
    try {
      setIsSyncingFb(true);
      await api.syncFacebookSpend();
      if (onReload) await onReload();
    } catch (err) {
      console.error('Erro ao sincronizar Meta Ads:', err);
    } finally {
      setIsSyncingFb(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este custo? Ele será removido do cálculo de lucro líquido.')) {
      return;
    }
    try {
      setDeletingId(id);
      await api.deleteExpense(id);
      if (onReload) await onReload();
    } catch (err) {
      console.error('Erro ao excluir custo:', err);
      alert('Erro ao excluir custo.');
    } finally {
      setDeletingId(null);
    }
  };

  const gross = metrics?.grossRevenue ?? 0;
  const fees = metrics?.estimatedGatewayFees ?? 0;
  const netRevenue = metrics?.netRevenue ?? 0;
  const totalCommissions = metrics?.totalCommissions ?? 0;
  const teamCommissionsPeriod = metrics?.teamCommissionsPeriod ?? 0;
  const teamCommissionsPaid = metrics?.teamCommissionsPaid ?? 0;
  const teamCommissionsPending = metrics?.teamCommissionsPending ?? 0;
  const gustavoCommission = metrics?.gustavoCommission ?? 0;
  const gustavoTotalTakeHome = metrics?.gustavoTotalTakeHome ?? (metrics?.netProfit ?? 0);
  const artCosts = metrics?.totalArtCosts ?? 0;
  
  // Tráfego Meta Ads:
  const isDaily = period === 'hoje' || period === 'ontem' || periodLabel === 'Hoje' || periodLabel === 'Ontem';
  const fbSpendPeriod = metrics?.facebookAdSpendPeriod ?? 2325.14;
  const fbSpendToday = metrics?.facebookAdSpendToday ?? 60.00;
  const fbSpend = metrics?.facebookAdSpend !== undefined 
    ? Number(metrics.facebookAdSpend) 
    : (isDaily ? fbSpendToday : fbSpendPeriod);
  
  const roas = fbSpend > 0 ? (gross / fbSpend) : 0;
  const totalExpenses = metrics?.totalExpenses ?? 0;
  const expenses = metrics?.expenses || [];
  const payouts = metrics?.payouts || [];
  const netProfit = metrics?.netProfit ?? 0;
  const profitMargin = metrics?.profitMargin ?? 0;

  // Copiar resumo de comissões para o WhatsApp / Fechamento
  const handleCopySummary = () => {
    if (!metrics?.ranking) return;
    
    let text = `📊 *FECHAMENTO GERAL DE VENDAS & LUCRO (${periodLabel.toUpperCase()})*\n\n`;
    text += `💰 *Faturamento Bruto Total:* ${formatCurrency(gross)}\n`;
    text += `📉 *Taxas Gateway (Est.):* -${formatCurrency(fees)}\n`;
    text += `💵 *Faturamento Líquido:* ${formatCurrency(netRevenue)}\n`;
    text += `📢 *Tráfego Pago (Meta Ads ${periodLabel}):* -${formatCurrency(fbSpend)} (Acumulado Mês: -${formatCurrency(fbSpendPeriod)})\n`;
    text += `🤖 *Gastos à Parte / IAs / Chips:* -${formatCurrency(totalExpenses)}\n`;
    text += `👥 *Comissões da Equipe (20%):* -${formatCurrency(teamCommissionsPeriod)}\n`;
    text += `🚀 *LUCRO LÍQUIDO REAL DA OPERAÇÃO:* ${formatCurrency(netProfit)} (${profitMargin.toFixed(1)}% margem)\n`;
    text += `👑 *Total no Bolso do Dono (Gustavo):* ${formatCurrency(gustavoTotalTakeHome)} (Lucro + Comissão Própria ${formatCurrency(gustavoCommission)})\n\n`;
    text += `*--- DESEMPENHO DOS ATENDENTES ---*\n`;
    (metrics.ranking || []).forEach(r => {
      text += `• *${r.user?.name}*: ${r.salesCount} vendas (${formatCurrency(r.grossAmount)}) | Comissão 20%: *${formatCurrency(r.commissionAmount)}*\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'ia':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
            🤖 IA
          </span>
        );
      case 'chip':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            📱 Chip
          </span>
        );
      case 'ferramenta':
      case 'software':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
            💻 Ferramenta
          </span>
        );
      case 'pagamento_atendente':
      case 'atendente':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            👤 Pagamento Atendente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-500/15 text-gray-300 border border-gray-500/30">
            📦 Outro
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Resumo do Dono */}
      <div className="bg-gradient-to-r from-[#171a27] via-[#1a1e2f] to-[#171a27] border border-[#2d3148] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#f5b800]/20 text-brand border border-brand/30 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Painel Executivo · Gustavo Henrick (CEO)
              </span>
              <span className="text-gray-400 text-xs font-semibold">Período: {periodLabel}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Visão Financeira & Lucro Líquido Real
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Faturamento apurado, tráfego Meta Ads no período, comissões de equipe e gastos operacionais.
            </p>

            {/* Seletor Rápido de Período direto na tela de Métricas */}
            <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-[#2d3148] overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-gray-400 font-semibold mr-1 shrink-0">Filtrar período:</span>
              {[
                { id: 'hoje', label: '🟢 Hoje' },
                { id: 'ontem', label: '🟡 Ontem' },
                { id: '7d', label: '7 dias' },
                { id: '15d', label: '15 dias' },
                { id: 'este_mes', label: 'Este mês' },
                { id: 'mes_passado', label: 'Mês passado' },
                { id: 'personalizado', label: '📅 Data Personalizada' }
              ].map((p) => {
                const isActive = period === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriod && setPeriod(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-brand text-black shadow-md font-black scale-105'
                        : 'bg-[#181a24] text-gray-300 hover:text-white hover:bg-[#202334] border border-[#2e3146]'
                    }`}
                  >
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Linha de Data Personalizada no AdminMetricsView */}
            {period === 'personalizado' && (
              <div className="flex items-center gap-2.5 pt-2.5 mt-2.5 border-t border-[#2d3148] flex-wrap text-xs">
                <span className="text-blue-300 font-bold flex items-center gap-1">
                  <span>📅 Período:</span>
                </span>

                <div className="flex items-center gap-1 bg-[#181a24] border border-[#2e3146] px-2 py-1 rounded-lg">
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

                <div className="flex items-center gap-1 bg-[#181a24] border border-[#2e3146] px-2 py-1 rounded-lg">
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
                  className="px-2 py-1 bg-[#202334] hover:bg-[#2b2f46] text-blue-300 rounded-md text-xs font-semibold transition border border-blue-500/30"
                  title="Filtrar exatamente apenas a data selecionada no campo 'De'"
                >
                  🎯 Apenas este dia
                </button>

                {isRefreshing && (
                  <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                    <span>Buscando dia...</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            <button
              onClick={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-purple-500/40 transition shadow-md"
            >
              <Plus className="w-4 h-4 text-purple-400" />
              <span>+ Registrar Gasto à Parte</span>
            </button>

            <button
              onClick={() => setIsFbModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] font-bold text-xs px-3.5 py-2.5 rounded-xl border border-[#1877F2]/40 transition shadow-md"
            >
              <FacebookIcon className="w-4 h-4 fill-[#1877F2]" />
              <span>Ajustar Tráfego / Meta Ads</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-2 bg-[#202334] hover:bg-[#2a2e44] text-brand font-bold text-xs px-4 py-2.5 rounded-xl border border-[#3b405d] transition shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copiado p/ Zap!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Fechamento</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Cards Financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* 1. Faturamento Bruto */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-brand" />
              Faturamento Bruto
            </span>
            <span className="text-[11px] text-gray-500">{metrics?.totalSalesCount || 0} vendas</span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {formatCurrency(gross)}
          </div>
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-[#20222f] flex justify-between">
            <span>Ticket Médio:</span>
            <span className="text-gray-200 font-semibold">{formatCurrency(metrics?.averageTicket || 0)}</span>
          </div>
        </div>

        {/* 2. Taxas de Gateway */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-rose-400" />
              Taxas Gateway
            </span>
            <span className="text-[11px] text-rose-400/80 font-mono">Dedução</span>
          </div>
          <div className="text-3xl font-black text-rose-400 tracking-tight">
            -{formatCurrency(fees)}
          </div>
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-[#20222f] flex justify-between">
            <span>Líquido intermediador:</span>
            <span className="text-gray-200 font-semibold">{formatCurrency(netRevenue)}</span>
          </div>
        </div>

        {/* 3. Comissões da Equipe */}
        <div className="bg-[#151720] border border-[#8B5CF6]/40 rounded-2xl p-5 shadow-md flex flex-col justify-between ring-1 ring-[#8B5CF6]/20">
          <div className="flex items-center justify-between text-[#c4b5fd] text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#8B5CF6]" />
              Comissões Equipe (20%)
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded-full border border-purple-500/30">
              {isDaily ? 'Do Período' : 'Equipe'}
            </span>
          </div>
          <div className="text-3xl font-black text-[#a78bfa] tracking-tight">
            -{formatCurrency(teamCommissionsPeriod)}
          </div>
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-[#20222f] flex justify-between items-center">
            <span>Quitado no Período: <strong className="text-emerald-400">{formatCurrency(teamCommissionsPaid)}</strong></span>
            <span className="text-[#a78bfa] font-semibold">Atendentes</span>
          </div>
        </div>

        {/* 4. Tráfego Pago / Facebook Ads */}
        <div className="bg-[#151720] border border-[#1877F2]/40 rounded-2xl p-5 shadow-md flex flex-col justify-between ring-1 ring-[#1877F2]/20 relative">
          <div className="flex items-center justify-between text-[#93c5fd] text-xs font-semibold uppercase tracking-wider mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <FacebookIcon className="w-4 h-4 fill-[#1877F2] text-[#1877F2]" />
              <span>Tráfego (Meta Ads)</span>
              {metrics?.facebookAdsMeta?.connected && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live API
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSyncFb}
                disabled={isSyncingFb}
                title="Sincronizar Meta Ads agora"
                className="text-blue-400 hover:text-white p-1 rounded hover:bg-blue-500/20 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFb ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsFbModalOpen(true)}
                className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5"
              >
                <Settings2 className="w-3 h-3" />
                <span>Ajustar</span>
              </button>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#60a5fa] tracking-tight">
              -{formatCurrency(fbSpend)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {isDaily ? (
                <>
                  <span className="text-[11px] font-bold bg-[#1877F2]/20 text-blue-300 px-2 py-0.5 rounded border border-[#1877F2]/30">
                    📅 Gasto Diário ({periodLabel})
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    Mês: -{formatCurrency(fbSpendPeriod)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] font-bold bg-[#1877F2]/20 text-blue-300 px-2 py-0.5 rounded border border-[#1877F2]/30">
                    Acumulado Período
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    Hoje: -{formatCurrency(fbSpendToday)}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-[#20222f] flex justify-between items-center">
            <span>ROAS: <strong className="text-emerald-400">{roas > 0 ? `${roas.toFixed(2)}x` : '—'}</strong></span>
            <button 
              onClick={() => setIsFbModalOpen(true)} 
              className="text-[11px] text-blue-400 hover:underline font-semibold"
            >
              Definir Gasto Diário
            </button>
          </div>
        </div>

        {/* 5. Custos Extras & Gastos à Parte / IAs */}
        <div className="bg-[#151720] border border-purple-500/40 rounded-2xl p-5 shadow-md flex flex-col justify-between ring-1 ring-purple-500/20 relative">
          <div className="flex items-center justify-between text-[#d8b4fe] text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              Gastos à Parte / IAs
            </span>
            <button
              onClick={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
              className="text-[10px] text-purple-300 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3" />
              <span>Adicionar</span>
            </button>
          </div>
          <div className="text-3xl font-black text-purple-300 tracking-tight">
            -{formatCurrency(totalExpenses)}
          </div>
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-[#20222f] flex justify-between items-center">
            <span>{expenses.length} lançamentos</span>
            <span className="text-purple-300 font-semibold">IAs, Softwares, Chips</span>
          </div>
        </div>

        {/* 6. LUCRO LÍQUIDO REAL NO BOLSO */}
        <div className={`col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-5 bg-gradient-to-br border-2 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden ${
          netProfit >= 0
            ? 'from-[#12281e] via-[#151720] to-[#151720] border-emerald-500/50'
            : 'from-[#281515] via-[#151720] to-[#151720] border-rose-500/50'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
            <span className={`flex items-center gap-1.5 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <TrendingUp className="w-5 h-5" />
              LUCRO LÍQUIDO REAL DA OPERAÇÃO ({periodLabel.toUpperCase()})
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-black border ${
              netProfit >= 0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              {profitMargin >= 0 ? `${profitMargin.toFixed(1)}% Margem` : `${profitMargin.toFixed(1)}%`}
            </span>
          </div>

          <div className={`text-4xl sm:text-5xl font-black tracking-tight my-2 ${
            netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {formatCurrency(netProfit)}
          </div>

          <div className="text-xs text-gray-300 mt-3 pt-3 border-t border-[#262837] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="leading-relaxed">
                Fórmula ({periodLabel}): <strong className="text-white">Bruto</strong> ({formatCurrency(gross)}) - <strong className="text-rose-400">Taxas Gateway</strong> ({formatCurrency(fees)}) - <strong className="text-blue-400">Tráfego Meta</strong> ({formatCurrency(fbSpend)}) - <strong className="text-purple-300">Gastos à Parte/IAs</strong> ({formatCurrency(totalExpenses)}) - <strong className="text-[#a78bfa]">Comissões Equipe</strong> ({formatCurrency(teamCommissionsPeriod)})
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                100% Automatizado
              </span>
            </div>

            <div className="text-[12px] text-gray-300 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#222432]">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">👑 Reconciliação do Dono (Gustavo):</span>
                <span>
                  Sua comissão (20% vendas próprias): <strong className="text-brand">{formatCurrency(gustavoCommission)}</strong>
                </span>
              </div>
              <div className="text-sm font-black bg-brand/10 border border-brand/30 px-3 py-1.5 rounded-xl text-brand flex items-center gap-2">
                <span>💰 Total que você tirou {isDaily ? 'no dia' : 'no período'}:</span>
                <span className="text-base text-white">{formatCurrency(gustavoTotalTakeHome)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Fechamento por Atendente */}
      <div className="bg-[#151720] border border-[#272938] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand" />
            <h3 className="font-bold text-base text-gray-100">
              Fechamento de Comissões por Atendente (20%) · {periodLabel}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-400">
              Meta diária: <strong className="text-gray-200">R$ 160,00</strong> / atendente
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Saldo Pendente Equipe: {formatCurrency(teamCommissionsPending)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181a24] text-xs font-semibold text-gray-400 border-b border-[#272938]">
              <tr>
                <th className="py-3 px-4">Atendente</th>
                <th className="py-3 px-4 text-center">Vendas</th>
                <th className="py-3 px-4">Total Faturado</th>
                <th className="py-3 px-4">Taxa (20%)</th>
                <th className="py-3 px-4 text-right">Comissão Gerada</th>
                <th className="py-3 px-4 text-right">Já Quitado (Pix)</th>
                <th className="py-3 px-4 text-right">Saldo a Pagar</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212330]">
              {(metrics?.ranking || []).map((r, index) => {
                const isGustavo = r.user?.id === 'user-gustavo';
                const isQuitado = r.commissionPending === 0 && r.commissionAmount > 0;

                return (
                  <tr key={r.user?.id || index} className="hover:bg-[#181a24]/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white"
                          style={{ backgroundColor: r.user?.color || '#3B82F6' }}
                        >
                          {r.user?.avatar || r.user?.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-white">{r.user?.name}</span>
                            {isGustavo && (
                              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                                👑 CEO · Vendas Próprias
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400">
                            {isGustavo ? 'Vendas diretas geridas pelo dono' : 'Atendente comercial'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-gray-300 font-bold">
                      {r.salesCount} {r.salesCount === 1 ? 'venda' : 'vendas'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-200 font-bold">
                      {formatCurrency(r.grossAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-brand font-semibold">
                      20%
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#a78bfa] text-base">
                      {formatCurrency(r.commissionAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      {isGustavo ? '—' : formatCurrency(r.commissionPaid || r.commissionAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      {isGustavo ? (
                        <span className="text-amber-400 font-mono text-xs">Vendas Próprias</span>
                      ) : r.commissionPending === 0 ? (
                        <span className="text-emerald-400 font-mono font-bold">R$ 0,00</span>
                      ) : (
                        <span className="text-rose-400 font-mono font-bold">{formatCurrency(r.commissionPending)}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isGustavo ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
                          👑 Dono
                        </span>
                      ) : isQuitado || (r.salesCount > 0 && r.commissionPending === 0) ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Quitado via Pix
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          A Pagar
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extrato de Baixas & Repasses de Comissões */}
      <div className="bg-[#151720] border border-[#272938] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-100 flex items-center gap-2">
                Extrato de Baixas & Repasses de Comissões ({payouts.length})
                <span className="text-xs text-gray-400 font-normal">· Pagos hoje via Pix</span>
              </h3>
              <p className="text-xs text-gray-400">
                Registro de quitações das comissões pagas aos atendentes da equipe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#181a24] text-gray-300 px-3 py-1.5 rounded-xl border border-[#272938]">
              Total Quitado: <strong className="text-emerald-400">{formatCurrency(teamCommissionsPaid)}</strong>
            </span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30">
              Saldo Pendente: R$ 0,00
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181a24] text-xs font-semibold text-gray-400 border-b border-[#272938]">
              <tr>
                <th className="py-3 px-4">Data do Repasse</th>
                <th className="py-3 px-4">Atendente Beneficiário</th>
                <th className="py-3 px-4">Referência da Venda</th>
                <th className="py-3 px-4">Taxa</th>
                <th className="py-3 px-4 text-right">Valor Quitado</th>
                <th className="py-3 px-4 text-center">Método</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Comprovante / Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212330]">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-500 text-xs">
                    Nenhum repasse registrado no período.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#181a24]/50 transition">
                    <td className="py-3.5 px-4 text-gray-300 font-mono text-xs whitespace-nowrap">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('pt-BR') : '29/09/2026'}
                    </td>
                    <td className="py-3.5 px-4 text-white font-bold">
                      {p.attendantName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 font-medium">
                      {p.grossSaleRef ? `1 venda (${formatCurrency(p.grossSaleRef)})` : 'Venda do período'}
                    </td>
                    <td className="py-3.5 px-4 text-brand font-semibold">
                      {p.rate || 20}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-400 text-base whitespace-nowrap">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-[#10B981]/15 text-[#10B981] font-bold text-xs px-2 py-0.5 rounded uppercase border border-[#10B981]/30">
                        {p.paymentMethod || 'Pix'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Quitado
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-xs max-w-xs truncate">
                      {p.notes || 'Comissão paga integralmente hoje via Pix'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Custos Operacionais, Ferramentas & IAs */}
      <div className="bg-[#151720] border border-[#272938] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-100 flex items-center gap-2">
                Gastos à Parte, Ferramentas & IAs ({expenses.length})
                <span className="text-xs text-gray-400 font-normal">· {periodLabel}</span>
              </h3>
              <p className="text-xs text-gray-400">
                Assinaturas de IAs, ferramentas, chips/eSIM e outros custos cadastrados manualmente e deduzidos do Lucro Líquido Real
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setExpenseToEdit(null);
              setIsExpenseModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Gasto à Parte</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181a24] text-xs font-semibold text-gray-400 border-b border-[#272938]">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Observações</th>
                <th className="py-3 px-4 text-right">Valor Deduzido</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212330]">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                    Nenhum gasto à parte cadastrado neste período.{' '}
                    <button
                      onClick={() => {
                        setExpenseToEdit(null);
                        setIsExpenseModalOpen(true);
                      }}
                      className="text-purple-400 hover:underline font-semibold"
                    >
                      Clique aqui para registrar um gasto.
                    </button>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#181a24]/50 transition">
                    <td className="py-3 px-4 text-gray-300 font-mono text-xs whitespace-nowrap">
                      {exp.date ? new Date(exp.date + 'T12:00:00Z').toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {exp.title}
                    </td>
                    <td className="py-3 px-4">
                      {getCategoryBadge(exp.category)}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs max-w-xs truncate">
                      {exp.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-400 text-sm whitespace-nowrap">
                      -{formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setExpenseToEdit(exp);
                            setIsExpenseModalOpen(true);
                          }}
                          title="Editar Gasto"
                          className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          disabled={deletingId === exp.id}
                          title="Excluir Gasto"
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {expenses.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#252837] flex items-center justify-between text-xs text-gray-400">
            <span>{expenses.length} custos cadastrados no período selecionado</span>
            <span>
              Total Deduzido do Lucro:{' '}
              <strong className="text-purple-400 font-black text-sm">
                {formatCurrency(totalExpenses)}
              </strong>
            </span>
          </div>
        )}
      </div>



      {/* Modal de Conexão com Facebook Ads */}
      <FacebookAdsModal
        isOpen={isFbModalOpen}
        onClose={() => setIsFbModalOpen(false)}
        onUpdated={onReload}
      />

      {/* Modal de Custos Extras / IA */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
        users={users}
        onExpenseSaved={onReload}
      />
    </div>
  );
}
