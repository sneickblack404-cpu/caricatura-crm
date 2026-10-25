import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  UserCheck, 
  Phone, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Target
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

export default function SalesCalendar({ 
  users = [], 
  whatsapps = [],
  onSelectDayForFilter 
}) {
  const currentBrazilMonth = getCurrentBrazilMonthStr();
  const [targetMonth, setTargetMonth] = useState(currentBrazilMonth);
  // 'gustavo' por padrão (para responder diretamente ao pedido do usuário) ou 'all'
  const [attendantFilter, setAttendantFilter] = useState('gustavo');
  const [whatsappFilter, setWhatsappFilter] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  // Carregar dados do calendário
  const loadCalendar = async (month, attId, wppId) => {
    try {
      setLoading(true);
      const res = await api.getMonthlyCalendar(month, attId, wppId);
      setData(res);
    } catch (err) {
      console.error('Erro ao buscar calendário:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar(targetMonth, attendantFilter, whatsappFilter);
  }, [targetMonth, attendantFilter, whatsappFilter]);

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
    totalGross: 0,
    totalSales: 0,
    dailyAverage: 0,
    bestDay: { date: '', day: 0, grossAmount: 0, salesCount: 0 },
    daysWithSales: 0,
    goalHitDays: 0
  };

  const isGustavoOnly = attendantFilter === 'gustavo' || attendantFilter === 'user-gustavo';

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Header de Controles do Calendário */}
      <div className="bg-[#151720] border border-[#272938] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navegador de Mês */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f5b800] to-[#d49900] text-black flex items-center justify-center font-black shadow-md shadow-yellow-500/10 shrink-0">
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
            <p className="text-xs text-gray-400">
              Vendas registradas dia a dia no calendário
            </p>
          </div>
        </div>

        {/* Botões de Ação & Filtros */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Alternar Mês: Anterior / Próximo */}
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
              className="px-2.5 py-1 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#222432] rounded-lg transition"
            >
              Hoje
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#222432] transition"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle: Minhas Vendas (Gustavo) vs Toda Empresa */}
          <div className="flex items-center bg-[#181a24] border border-[#272938] rounded-xl p-1">
            <button
              onClick={() => setAttendantFilter('gustavo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isGustavoOnly
                  ? 'bg-brand text-black shadow-sm font-extrabold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Minhas Vendas (Gustavo)</span>
            </button>
            <button
              onClick={() => setAttendantFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                attendantFilter === 'all'
                  ? 'bg-brand text-black shadow-sm font-extrabold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Toda a Empresa</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Banner de Métricas Resumo do Mês */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Faturamento do Mês */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <DollarSign className="w-3.5 h-3.5 text-brand" />
            <span>Faturado no Mês</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {formatCurrency(summary.totalGross)}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-[#20222f]">
            {isGustavoOnly ? 'Vendas diretas do Gustavo' : 'Vendas gerais de toda equipe'}
          </div>
        </div>

        {/* Card 2: Quantidade de Vendas */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Total de Vendas</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            {summary.totalSales} vendas
          </div>
          <div className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-[#20222f]">
            {summary.daysWithSales} dias com vendas no mês
          </div>
        </div>

        {/* Card 3: Média Diária */}
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Média por Dia Vendido</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-400 tracking-tight">
            {formatCurrency(summary.dailyAverage)}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-[#20222f]">
            {summary.goalHitDays} dias atingiram meta (R$ 160+)
          </div>
        </div>

        {/* Card 4: Melhor Dia */}
        <div className="bg-[#151720] border border-[#f5b800]/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between ring-1 ring-[#f5b800]/20">
          <div className="flex items-center gap-1.5 text-brand text-xs font-semibold uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5 text-brand" />
            <span>Melhor Dia do Mês</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-brand tracking-tight">
            {summary.bestDay?.grossAmount > 0 
              ? formatCurrency(summary.bestDay.grossAmount)
              : '—'}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-[#20222f]">
            {summary.bestDay?.day ? (
              <span>Dia {summary.bestDay.day} ({summary.bestDay.salesCount} vendas)</span>
            ) : (
              <span>Nenhuma venda ainda</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Grid do Calendário Mensal */}
      <div className="bg-[#151720] border border-[#272938] rounded-2xl p-3.5 sm:p-5 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 flex items-center justify-center text-gray-400 gap-3">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Carregando calendário de vendas...</span>
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
                  className="min-h-[75px] sm:min-h-[105px] rounded-xl bg-[#12131b]/40 border border-[#1b1c28]/40 opacity-30 pointer-events-none" 
                />
              ))}

              {/* Dias do Mês */}
              {(data?.days || []).map((dayItem) => {
                const hasSales = dayItem.grossAmount > 0;
                const isGoalMet = dayItem.grossAmount >= 160;
                const isSelected = selectedDay?.date === dayItem.date;

                return (
                  <button
                    key={dayItem.date}
                    onClick={() => setSelectedDay(dayItem)}
                    className={`min-h-[75px] sm:min-h-[105px] rounded-xl p-2 sm:p-2.5 text-left flex flex-col justify-between transition relative border active:scale-[0.98] ${
                      isSelected
                        ? 'border-brand bg-brand/15 ring-2 ring-brand/40 shadow-lg'
                        : dayItem.isToday
                          ? 'border-brand/70 bg-[#1c1e2b] shadow-md ring-1 ring-brand/30'
                          : hasSales
                            ? 'bg-[#181a24] hover:bg-[#202230] border-[#292b3c] hover:border-gray-500'
                            : 'bg-[#14151e] border-[#222432] opacity-70 hover:opacity-100 hover:bg-[#181a24]'
                    }`}
                  >
                    {/* Cabeçalho da Célula: Número do Dia + Badge Hoje */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs sm:text-sm font-black ${
                        dayItem.isToday ? 'text-brand' : hasSales ? 'text-white' : 'text-gray-400'
                      }`}>
                        {dayItem.day}
                      </span>
                      {dayItem.isToday && (
                        <span className="text-[9px] font-black bg-brand text-black px-1.5 py-0.2 rounded uppercase">
                          Hoje
                        </span>
                      )}
                    </div>

                    {/* Conteúdo: Valor Vendido no Dia */}
                    <div className="my-1">
                      {hasSales ? (
                        <>
                          <div className={`text-xs sm:text-base font-black tracking-tight leading-tight ${
                            isGoalMet ? 'text-emerald-400' : 'text-[#f5b800]'
                          }`}>
                            {formatCurrency(dayItem.grossAmount)}
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium mt-0.5 hidden sm:block">
                            {dayItem.salesCount} {dayItem.salesCount === 1 ? 'venda' : 'vendas'}
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-600 text-xs">—</div>
                      )}
                    </div>

                    {/* Rodapé da Célula: Meta / Status */}
                    <div className="w-full">
                      {hasSales ? (
                        isGoalMet ? (
                          <div className="w-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded text-[9px] sm:text-[10px] font-bold px-1 py-0.5 text-center truncate">
                            🎯 Meta R$ 160
                          </div>
                        ) : (
                          <div className="w-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded text-[9px] sm:text-[10px] font-semibold px-1 py-0.5 text-center truncate">
                            {dayItem.salesCount} vend.
                          </div>
                        )
                      ) : (
                        <div className="h-4" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Modal / Drawer de Inspeção do Dia Selecionado */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#151720] border border-[#272938] w-full max-w-lg max-h-[92dvh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header do Dia */}
            <div className="px-5 sm:px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27]">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider block">
                  Detalhamento do Dia
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

            {/* Resumo Rápido do Dia */}
            <div className="p-4 bg-[#181a24] border-b border-[#252837] flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-gray-400 block">Total Vendido neste dia:</span>
                <span className="text-2xl font-black text-emerald-400">
                  {formatCurrency(selectedDay.grossAmount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Vendas realizadas:</span>
                <span className="text-lg font-black text-white">
                  {selectedDay.salesCount} vendas
                </span>
              </div>
            </div>

            {/* Lista das Vendas do Dia */}
            <div className="p-4 space-y-2.5 overflow-y-auto flex-1 max-h-[50vh]">
              {selectedDay.sales?.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">
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
                        <span className="font-black text-base text-[#f5b800] block">
                          {formatCurrency(sale.amount)}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">
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
                className="w-full bg-brand font-black text-xs py-3 rounded-xl shadow-md transition active:scale-[0.98] text-black flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4 stroke-[2.5]" />
                <span>Ver Fechamento Completo & Lucro deste Dia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
