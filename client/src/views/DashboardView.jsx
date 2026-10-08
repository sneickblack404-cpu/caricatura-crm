import React, { useState } from 'react';
import { 
  DollarSign, 
  Target, 
  Percent, 
  Gift, 
  CalendarClock, 
  Plus, 
  ChevronRight, 
  MessageCircle, 
  ExternalLink,
  Flame,
  UserCheck,
  Building2,
  Trash2,
  Check
} from 'lucide-react';
import RankingBoard from '../components/RankingBoard';
import { formatCurrency, formatPhone, api } from '../api';

export default function DashboardView({ 
  metrics, 
  currentUser, 
  sales = [], 
  followups = [], 
  onOpenSaleModal,
  onViewAllSales,
  onViewAllFollowups,
  onReload,
  periodLabel = 'Hoje'
}) {
  const isAdmin = currentUser?.role === 'admin';
  const [ceoViewMode, setCeoViewMode] = useState('personal'); // 'personal' (Minhas vendas) ou 'company' (Geral da empresa)

  // Métricas do usuário logado (Gustavo ou atendente)
  const userMetrics = currentUser?.id && metrics?.commissionsByAttendant
    ? metrics.commissionsByAttendant[currentUser.id]
    : null;

  const isViewingPersonal = !isAdmin || ceoViewMode === 'personal';

  // Se for visualização pessoal, faturamento próprio; se for visão da empresa, faturamento total
  const myGross = isViewingPersonal 
    ? (userMetrics?.grossAmount || 0) 
    : (metrics?.grossRevenue || 0);

  const mySalesCount = isViewingPersonal 
    ? (userMetrics?.salesCount || 0) 
    : (metrics?.totalSalesCount || 0);

  const myCommissionRate = currentUser?.commissionRate || 20;
  const myCommission = isViewingPersonal
    ? (userMetrics?.commissionAmount || (myGross * (myCommissionRate / 100)))
    : (metrics?.totalCommissions || 0);

  const myGoal = currentUser?.dailyGoal || 160.00;
  const goalProgress = myGoal > 0 ? Math.min(100, Math.round((myGross / myGoal) * 100)) : 0;
  const remainingForGoal = Math.max(0, myGoal - myGross);

  // Vendas a exibir na listagem rápida
  const displaySales = isViewingPersonal 
    ? sales.filter(s => s.attendantId === currentUser?.id).slice(0, 5) 
    : sales.slice(0, 5);

  const handleToggleFollowup = async (fu) => {
    try {
      await api.updateFollowup(fu.id, {
        status: fu.status === 'pendente' ? 'concluido' : 'pendente'
      });
      if (onReload) onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFollowup = async (fu) => {
    if (window.confirm(`Deseja remover o follow-up de "${fu.customerName}"?`)) {
      try {
        await api.deleteFollowup(fu.id);
        if (onReload) onReload();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Visão para o CEO Gustavo */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151720] border border-[#272938] rounded-2xl p-3 px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse"></span>
            <span className="text-xs font-bold text-gray-200">Painel do CEO · Alternar Modo:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#181a24] p-1 rounded-xl border border-[#272938]">
            <button
              onClick={() => setCeoViewMode('personal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                ceoViewMode === 'personal'
                  ? 'bg-brand text-black shadow-sm font-extrabold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Minhas Vendas & Comissão (Gustavo)</span>
            </button>
            <button
              onClick={() => setCeoViewMode('company')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                ceoViewMode === 'company'
                  ? 'bg-brand text-black shadow-sm font-extrabold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Visão Geral da Empresa</span>
            </button>
          </div>
        </div>
      )}
      {/* 5 Cards Superiores no estilo exato do X1 CRM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Faturamento */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <DollarSign className="w-3.5 h-3.5 text-brand" />
              <span>{isAdmin ? 'FATURAMENTO TOTAL' : 'FATURAMENTO'}</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(myGross)}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-[#20222f] flex items-center justify-between">
            <span>{mySalesCount} vendas</span>
            <span className="text-brand font-medium">{periodLabel}</span>
          </div>
        </div>

        {/* Card 2: Meta Diária de R$ 160,00 */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Target className="w-3.5 h-3.5 text-rose-500" />
              <span>META DIÁRIA (R$ 160)</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-2">
              <span>{goalProgress}%</span>
              {goalProgress >= 100 && (
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Batida! 🎉
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#20222f]">
            <div className="w-full bg-[#0c0d12] h-1.5 rounded-full overflow-hidden mb-1">
              <div 
                className="h-full bg-rose-500 transition-all duration-700" 
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-gray-400 flex items-center justify-between">
              <span>{formatCurrency(myGross)}</span>
              <span>/ R$ 160,00 no dia</span>
            </div>
          </div>
        </div>

        {/* Card 3: Comissão */}
        <div className="bg-[#151720] border border-[#8B5CF6]/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative ring-1 ring-[#8B5CF6]/20">
          <div>
            <div className="flex items-center gap-2 text-[#a78bfa] text-xs font-semibold uppercase tracking-wider mb-2">
              <Percent className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>{isAdmin ? 'COMISSÕES A PAGAR' : `SUA COMISSÃO (${myCommissionRate}%)`}</span>
            </div>
            <div className="text-2xl font-black text-[#8B5CF6] tracking-tight">
              {formatCurrency(myCommission)}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-[#20222f]">
            <span>sobre {formatCurrency(myGross)}</span>
          </div>
        </div>

        {/* Card 4: Bônus Meta */}
        <div className="bg-[#151720] border border-[#10B981]/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between ring-1 ring-[#10B981]/20">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Gift className="w-3.5 h-3.5 text-emerald-400" />
              <span>BÔNUS META</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              {goalProgress >= 100 ? 'R$ 150,00' : 'R$ 0,00'}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-[#20222f]">
            {remainingForGoal > 0 ? (
              <span>Faltam {formatCurrency(remainingForGoal)} p/ meta de R$ 160</span>
            ) : (
              <span className="text-emerald-400 font-bold">Bônus liberado!</span>
            )}
          </div>
        </div>

        {/* Card 5: Follow-ups Pendentes */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <CalendarClock className="w-3.5 h-3.5 text-sky-400" />
              <span>FOLLOW-UPS</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {metrics?.pendingFollowups || 0}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-[#20222f] flex items-center justify-between">
            <span>em aberto</span>
            <button onClick={onViewAllFollowups} className="text-sky-400 hover:underline">
              ver todos
            </button>
          </div>
        </div>
      </div>

      {/* Ranking da Equipe */}
      <RankingBoard 
        ranking={metrics?.ranking || []} 
        currentUser={currentUser} 
        periodLabel={periodLabel}
        onOpenSalesList={onViewAllSales}
      />

      {/* Grid Inferior: Últimas Vendas + Follow-ups Hoje */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box Últimas Vendas */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f5b800]" />
                <h3 className="font-bold text-base text-gray-100">Últimas Vendas</h3>
              </div>
              <button
                onClick={onViewAllSales}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {displaySales.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                Nenhuma venda registrada no período selecionado.
              </div>
            ) : (
              <div className="space-y-2.5">
                {displaySales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 bg-[#181a24] rounded-xl border border-[#262837] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#202330] flex items-center justify-center font-bold text-[#f5b800] text-xs">
                        {sale.attendantName?.[0] || 'V'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-100">{sale.customerName}</span>
                          <span className="text-[11px] text-gray-400 bg-[#252837] px-2 py-0.5 rounded">
                            {sale.profession}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span>{sale.attendantName}</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] text-emerald-400 font-bold">{sale.paymentMethod}</span>
                          {sale.customerPhone && (
                            <>
                              <span>•</span>
                              <a
                                href={`https://wa.me/55${sale.customerPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                {formatPhone(sale.customerPhone)}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-base text-[#f5b800]">
                        {formatCurrency(sale.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Destaque "+ Registrar Venda" com cor dinâmica */}
          <button
            onClick={onOpenSaleModal}
            className="w-full mt-5 bg-brand font-black text-sm py-3.5 rounded-xl shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Registrar Venda</span>
          </button>
        </div>

        {/* Box Follow-ups Hoje */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <h3 className="font-bold text-base text-gray-100">Follow-ups & Retornos</h3>
              </div>
              <button
                onClick={onViewAllFollowups}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {followups.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                Nenhum follow-up pendente para hoje. Bom trabalho!
              </div>
            ) : (
              <div className="space-y-2.5">
                {followups.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-3 bg-[#181a24] rounded-xl border border-[#262837] flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-100 truncate">{fu.customerName}</span>
                        {fu.profession && (
                          <span className="text-[11px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 shrink-0">
                            {fu.profession}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{fu.notes || 'Sem observações'}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      {fu.customerPhone && (
                        <a
                          href={`https://wa.me/55${fu.customerPhone.replace(/\D/g, '')}?text=Ol%C3%A1%2C+tudo+bem%3F+Passando+para+acompanhar+sua+caricatura%21`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-lg flex items-center gap-1 transition"
                          title="Chamar no WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-black" />
                          <span className="hidden sm:inline">Chamar</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleToggleFollowup(fu)}
                        className="w-7 h-7 rounded-lg bg-[#20222f] hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 border border-[#2d3042] flex items-center justify-center transition"
                        title="Marcar como concluído"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      <button
                        onClick={() => handleDeleteFollowup(fu)}
                        className="w-7 h-7 rounded-lg bg-[#20222f] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-[#2d3042] flex items-center justify-center transition"
                        title="Excluir follow-up"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 p-3 bg-[#181a24] rounded-xl border border-[#262837] text-xs text-gray-400 flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#f5b800] shrink-0" />
            <span>Retornar contatos em até 24h aumenta em 40% o fechamento de pedidos de caricatura!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
