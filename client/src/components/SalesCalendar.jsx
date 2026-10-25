import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  TrendingUp, 
  DollarSign, 
  Phone, 
  X, 
  Sparkles, 
  Target,
  ArrowUpRight,
  ShoppingBag,
  Percent,
  Receipt
} from 'lucide-react';
import { api, formatCurrency, formatPhone } from '../api';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getCurrentBrazilMonthStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export default function SalesCalendar({ onSelectDayForFilter }) {
  const currentBrazilMonth = getCurrentBrazilMonthStr();
  const [targetMonth, setTargetMonth] = useState(currentBrazilMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  // Carregar dados do calendário de vendas e lucro líquido
  const loadCalendar = async (month) => {
    try {
      setLoading(true);
      const res = await api.getMonthlyCalendar(month);
      setData(res);
    } catch (err) {
      console.error('Erro ao buscar calendário:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar(targetMonth);
  }, [targetMonth]);

  // Navegação de mês
  const handlePrevMonth = () => {
    const [y, m] = targetMonth.split('-').map(Number);
    let newYear = y;
    let newMonth = m - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setTargetMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = targetMonth.split('-').map(Number);
    let newYear = y;
    let newMonth = m + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setTargetMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    setTargetMonth(currentBrazilMonth);
  };

  // Formatação do título do mês atual
  const [yearStr, monthStr] = targetMonth.split('-');
  const monthTitle = `${MONTH_NAMES[parseInt(monthStr, 10) - 1]} de ${yearStr}`;

  // Primeiro dia da semana do mês para preencher espaços vazios no grid (0 = Domingo)
  const firstDayWeekday = data?.days?.[0]?.weekday ?? 0;
  const blankDays = Array.from({ length: firstDayWeekday });

  const summary = data?.summary || {
    totalNetProfit: 0,
    totalGross: 0,
    totalAds: 0,
    totalTeamCommissions: 0,
    totalGatewayFees: 0,
    totalExpenses: 0,
    totalSales: 0,
    dailyAverage: 0,
    dailyGrossAverage: 0,
    bestDay: { date: '', day: 0, netProfit: 0, grossAmount: 0, salesCount: 0 },
    daysWithSales: 0,
    profitableDays: 0,
    lossDays: 0
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Header de Controles do Calendário */}
      <div className="bg-[#151720] border border-[#272938] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navegador de Mês */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f5b800] to-emerald-500 text-black flex items-center justify-center font-black shadow-md shadow-emerald-500/10 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight capitalize">
                {monthTitle}
              </h2>
              {targetMonth === currentBrazilMonth && (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Mês Atual
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
              <span>Dia a dia com o <strong>total vendido no geral</strong> e o <strong>lucro líquido</strong></span>
            </p>
          </div>
        </div>

        {/* Botões de Navegação de Mês */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#181a24] border border-[#272938] rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#222432] transition"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleCurrentMonth}
              className="px-3 py-1 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#222432] rounded-lg transition"
            >
              Mês Atual
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#222432] transition"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Banner de Métricas Resumo do Mês */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Faturamento Bruto Geral */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-brand text-xs font-semibold uppercase tracking-wider mb-1">
            <DollarSign className="w-3.5 h-3.5 text-brand" />
            <span>Vendido no Geral (Mês)</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {formatCurrency(summary.totalGross)}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-[#20222f]">
            {summary.totalSales} vendas realizadas no total
          </div>
        </div>

        {/* Card 2: Lucro Líquido Real */}
        <div className="bg-[#151720] border border-emerald-500/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between ring-1 ring-emerald-500/15 bg-gradient-to-br from-[#151720] to-[#12221b]/40">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Lucro Líquido Real</span>
          </div>
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${
            summary.totalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {summary.totalNetProfit >= 0 ? '+' : ''}{formatCurrency(summary.totalNetProfit)}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-[#20222f] flex items-center justify-between">
            <span>{summary.profitableDays} dias no verde</span>
            {summary.lossDays > 0 && (
              <span className="text-rose-400">{summary.lossDays} dias no prejuízo</span>
            )}
          </div>
        </div>

        {/* Card 3: Médias Diárias */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
            <span>Médias / Dia Vendido</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-gray-200">
              Vendido: <strong className="text-white font-black">{formatCurrency(summary.dailyGrossAverage || (summary.daysWithSales > 0 ? summary.totalGross / summary.daysWithSales : 0))}</strong>
            </div>
            <div className="text-sm font-black text-emerald-400">
              Lucro: +{formatCurrency(summary.dailyAverage)}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-[#20222f]">
            Média nos {summary.daysWithSales} dias com vendas
          </div>
        </div>

        {/* Card 4: Melhor Dia */}
        <div className="bg-[#151720] border border-[#f5b800]/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between ring-1 ring-[#f5b800]/20">
          <div className="flex items-center gap-1.5 text-brand text-xs font-semibold uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5 text-brand" />
            <span>Melhor Dia do Mês</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-base sm:text-lg font-black text-emerald-400">
              {summary.bestDay?.netProfit > 0 
                ? `Lucro: +${formatCurrency(summary.bestDay.netProfit)}`
                : '—'}
            </div>
            <div className="text-xs text-gray-300 font-semibold truncate">
              Vendeu: {formatCurrency(summary.bestDay?.grossAmount || 0)} ({summary.bestDay?.salesCount || 0}v)
            </div>
          </div>
          <div className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-[#20222f]">
            {summary.bestDay?.day ? (
              <span>Dia {summary.bestDay.day} do mês</span>
            ) : (
              <span>Nenhuma venda ainda</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Grid do Calendário Mensal */}
      <div className="bg-[#151720] border border-[#272938] rounded-2xl p-2.5 sm:p-5 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 flex items-center justify-center text-gray-400 gap-3">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Carregando faturamento e lucro dia a dia...</span>
          </div>
        ) : (
          <div>
            {/* Linha dos Dias da Semana */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
              {WEEKDAYS.map((wd, idx) => (
                <div 
                  key={wd} 
                  className={`text-xs font-bold py-1.5 rounded-lg ${
                    idx === 0 || idx === 6 
                      ? 'text-gray-500 bg-[#181a24]/50' 
                      : 'text-gray-300 bg-[#181a24]'
                  }`}
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Grid dos Dias do Mês */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Células vazias antes do dia 1 */}
              {blankDays.map((_, idx) => (
                <div 
                  key={`blank-${idx}`} 
                  className="min-h-[82px] sm:min-h-[110px] rounded-xl bg-[#12131b]/40 border border-[#1b1c28]/40 opacity-30 pointer-events-none" 
                />
              ))}

              {/* Dias do Mês */}
              {(data?.days || []).map((dayItem) => {
                const hasActivity = dayItem.grossAmount > 0 || dayItem.adSpend > 0;
                const isProfitable = dayItem.netProfit > 0;
                const isLoss = dayItem.netProfit < 0;
                const isSelected = selectedDay?.date === dayItem.date;

                return (
                  <button
                    key={dayItem.date}
                    onClick={() => setSelectedDay(dayItem)}
                    className={`min-h-[82px] sm:min-h-[110px] rounded-xl p-1.5 sm:p-2.5 text-left flex flex-col justify-between transition relative border active:scale-[0.98] ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-400/40 shadow-lg'
                        : dayItem.isToday
                          ? 'border-brand/80 bg-[#1c1e2b] shadow-md ring-1 ring-brand/40'
                          : isProfitable
                            ? 'bg-[#181a24] hover:bg-[#1e2330] border-[#292b3c] hover:border-emerald-500/40'
                            : isLoss
                              ? 'bg-[#1b151a] hover:bg-[#241a22] border-rose-950/60 hover:border-rose-500/30'
                              : 'bg-[#14151e] border-[#222432] opacity-70 hover:opacity-100 hover:bg-[#181a24]'
                    }`}
                  >
                    {/* Cabeçalho da Célula: Dia + Badge Hoje / Vendas */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs sm:text-sm font-black ${
                        dayItem.isToday ? 'text-brand' : hasActivity ? 'text-white' : 'text-gray-500'
                      }`}>
                        {dayItem.day}
                      </span>
                      {dayItem.isToday ? (
                        <span className="text-[8px] sm:text-[9px] font-black bg-brand text-black px-1.5 py-0.2 rounded uppercase">
                          Hoje
                        </span>
                      ) : hasActivity ? (
                        <span className="text-[9px] sm:text-[10px] text-gray-400 font-semibold">
                          {dayItem.salesCount}v
                        </span>
                      ) : null}
                    </div>

                    {/* Conteúdo: 1) TANTO QUE VENDEU NUM GERAL + 2) LUCRO LÍQUIDO DO DIA */}
                    {hasActivity ? (
                      <div className="my-auto w-full space-y-1">
                        {/* 1. Tanto que vendeu num geral (Bruto) */}
                        <div className="leading-tight">
                          <span className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider block sm:inline sm:mr-1">
                            Vendido:
                          </span>
                          <span className="text-[11px] sm:text-sm font-black text-white tracking-tight">
                            {formatCurrency(dayItem.grossAmount)}
                          </span>
                        </div>

                        {/* 2. Lucro Líquido do Dia */}
                        <div className="leading-tight pt-1 border-t border-[#232636]">
                          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider block sm:inline sm:mr-1 text-gray-400">
                            Lucro:
                          </span>
                          <span className={`text-[11px] sm:text-sm font-black tracking-tight ${
                            isProfitable 
                              ? 'text-emerald-400' 
                              : isLoss 
                                ? 'text-rose-400' 
                                : 'text-gray-300'
                          }`}>
                            {isProfitable ? '+' : ''}{formatCurrency(dayItem.netProfit)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-600 text-xs font-semibold my-auto text-center">—</div>
                    )}

                    {/* Rodapé da Célula: Badge Status / Margem */}
                    <div className="w-full">
                      {hasActivity ? (
                        isProfitable ? (
                          <div className="w-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded text-[8px] sm:text-[9px] font-bold px-1 py-0.5 text-center truncate">
                            {dayItem.grossAmount > 0 
                              ? `${Math.round((dayItem.netProfit / dayItem.grossAmount) * 100)}% lucro`
                              : '+Lucro'}
                          </div>
                        ) : isLoss ? (
                          <div className="w-full bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded text-[8px] sm:text-[9px] font-bold px-1 py-0.5 text-center truncate">
                            Prejuízo
                          </div>
                        ) : (
                          <div className="w-full bg-gray-500/15 border border-gray-500/30 text-gray-400 rounded text-[8px] sm:text-[9px] font-semibold px-1 py-0.5 text-center truncate">
                            R$ 0,00
                          </div>
                        )
                      ) : (
                        <div className="h-3 sm:h-4" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Modal / Detalhamento Completo do Dia Selecionado */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#151720] border border-[#272938] w-full max-w-lg max-h-[92dvh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header do Dia */}
            <div className="px-5 sm:px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27]">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider block">
                  Fechamento do Dia
                </span>
                <h3 className="font-black text-lg text-white">
                  Dia {selectedDay.day} de {monthTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="w-8 h-8 rounded-lg bg-[#212330] hover:bg-[#2b2e40] text-gray-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Destaque Duplo: 1) TANTO QUE VENDEU NUM GERAL + 2) LUCRO LÍQUIDO DO DIA */}
            <div className="p-4 bg-gradient-to-br from-[#181a24] to-[#12221b] border-b border-[#252837]">
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* 1. Tanto que vendeu num geral */}
                <div className="bg-[#141620] p-3 rounded-xl border border-[#272938]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    💰 TOTAL VENDIDO NO GERAL
                  </span>
                  <div className="text-2xl font-black text-white tracking-tight mt-0.5">
                    {formatCurrency(selectedDay.grossAmount)}
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium block mt-0.5">
                    {selectedDay.salesCount} {selectedDay.salesCount === 1 ? 'venda' : 'vendas'}
                  </span>
                </div>

                {/* 2. Lucro Líquido do Dia */}
                <div className="bg-[#141620] p-3 rounded-xl border border-emerald-500/30">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    🚀 LUCRO LÍQUIDO DO DIA
                  </span>
                  <div className={`text-2xl font-black tracking-tight mt-0.5 ${
                    selectedDay.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {selectedDay.netProfit >= 0 ? '+' : ''}{formatCurrency(selectedDay.netProfit)}
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium block mt-0.5">
                    {selectedDay.grossAmount > 0 
                      ? `${Math.round((selectedDay.netProfit / selectedDay.grossAmount) * 100)}% margem livre`
                      : 'Livre de despesas'}
                  </span>
                </div>
              </div>

              {/* DRE Diária Detalhada */}
              <div className="pt-2 border-t border-[#252837] grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#141620]/70 p-2 rounded-lg border border-[#272938]">
                  <span className="text-gray-400 block text-[10px]">📉 Taxas de Gateway</span>
                  <span className="text-xs font-bold text-rose-400 block mt-0.5">
                    -{formatCurrency(selectedDay.gatewayFees)}
                  </span>
                </div>
                <div className="bg-[#141620]/70 p-2 rounded-lg border border-[#272938]">
                  <span className="text-gray-400 block text-[10px]">📢 Tráfego Meta Ads</span>
                  <span className="text-xs font-bold text-rose-400 block mt-0.5">
                    -{formatCurrency(selectedDay.adSpend)}
                  </span>
                </div>
                <div className="bg-[#141620]/70 p-2 rounded-lg border border-[#272938]">
                  <span className="text-gray-400 block text-[10px]">👥 Comissões Equipe (20%)</span>
                  <span className="text-xs font-bold text-rose-400 block mt-0.5">
                    -{formatCurrency(selectedDay.teamCommissions)}
                  </span>
                </div>
                <div className="bg-[#141620]/70 p-2 rounded-lg border border-[#272938]">
                  <span className="text-gray-400 block text-[10px]">🤖 Gastos Extras / IAs</span>
                  <span className="text-xs font-bold text-rose-400 block mt-0.5">
                    -{formatCurrency(selectedDay.expenses)}
                  </span>
                </div>
              </div>
            </div>

            {/* Lista das Vendas do Dia */}
            <div className="p-4 space-y-2 overflow-y-auto flex-1 max-h-[38vh]">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-1 px-1">
                <span>Vendas do Dia ({selectedDay.sales?.length || 0})</span>
                <span>Valor & Método</span>
              </div>
              {selectedDay.sales?.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  Nenhuma venda foi registrada neste dia.
                </div>
              ) : (
                selectedDay.sales.map((sale) => {
                  const saleTime = new Date(sale.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div 
                      key={sale.id}
                      className="p-3 bg-[#181a24] rounded-xl border border-[#272938] flex items-center justify-between gap-3 hover:bg-[#1e202d] transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 font-mono">
                            {saleTime}
                          </span>
                          <span className="bg-[#242738] text-gray-200 text-xs px-2 py-0.5 rounded font-medium">
                            {sale.profession || 'Caricatura'}
                          </span>
                          <span className="text-xs text-gray-400 truncate">
                            • {sale.attendantName}
                          </span>
                        </div>

                        {sale.customerPhone && (
                          <div className="mt-1">
                            <a
                              href={`https://wa.me/55${sale.customerPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{formatPhone(sale.customerPhone)}</span>
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-base text-white block">
                          {formatCurrency(sale.amount)}
                        </span>
                        <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                          {sale.paymentMethod || 'PIX'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer com Ação de Filtrar o Painel Geral por Este Dia */}
            <div className="p-4 bg-[#191c27] border-t border-[#252837] flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onSelectDayForFilter) {
                    onSelectDayForFilter(selectedDay.date);
                  }
                  setSelectedDay(null);
                }}
                className="w-full bg-brand hover:bg-[#d49900] font-black text-xs py-3 rounded-xl shadow-md transition active:scale-[0.98] text-black flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4 stroke-[2.5]" />
                <span>Abrir Fechamento Completo deste Dia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
