import React from 'react';
import { Trophy, ChevronRight, Award } from 'lucide-react';
import { formatCurrency } from '../api';

export default function RankingBoard({ ranking = [], currentUser, periodLabel = 'Hoje', onOpenSalesList }) {
  // Encontrar o maior valor para calcular a barra proporcional
  const maxGross = Math.max(...ranking.map(r => r.grossAmount || 0), 1);

  return (
    <div className="bg-[#151720] border border-[#272938] rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-brand" />
          <h3 className="font-bold text-base text-gray-100">
            Ranking · <span className="text-brand">{periodLabel}</span>
          </h3>
        </div>
        {onOpenSalesList && (
          <button
            onClick={onOpenSalesList}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>Ver completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {ranking.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Nenhuma venda registrada para este período.
          </div>
        ) : (
          ranking.map((item, index) => {
            const isMe = currentUser?.id === item.user?.id;
            const rankPos = index + 1;
            const percentWidth = Math.min(100, Math.round(((item.grossAmount || 0) / maxGross) * 100));

            // Cores das posições 1, 2, 3
            let badgeBg = 'bg-[#252836] text-gray-300';
            if (rankPos === 1) badgeBg = 'bg-brand text-black font-extrabold shadow-sm';
            if (rankPos === 2) badgeBg = 'bg-gray-300 text-black font-bold';
            if (rankPos === 3) badgeBg = 'bg-amber-700/80 text-white font-bold';

            return (
              <div
                key={item.user?.id || index}
                className={`p-3.5 rounded-xl transition border ${
                  isMe
                    ? 'bg-[#212330] border-brand/50 shadow-md ring-1 ring-brand/20'
                    : 'bg-[#181a24] border-[#252736] hover:border-[#323648]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {/* Badge Posição */}
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${badgeBg}`}>
                      {rankPos}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow"
                      style={{ backgroundColor: item.user?.color || '#3B82F6' }}
                    >
                      {item.user?.avatar || item.user?.name?.[0] || 'V'}
                    </div>

                    {/* Nome & Comissão */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-100">
                          {item.user?.name}
                        </span>
                        {isMe && (
                          <span className="text-[11px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded">
                            (você)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        comissão: <span className="text-[#8B5CF6] font-medium">{formatCurrency(item.commissionAmount)}</span>
                        <span className="text-[11px] text-gray-500 ml-1.5">({item.salesCount} vendas)</span>
                      </span>
                    </div>
                  </div>

                  {/* Valor Total Vendido */}
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-100">
                      {formatCurrency(item.grossAmount)}
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso Relativo */}
                <div className="w-full bg-[#101117] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-700 ${
                      rankPos === 1 ? 'bg-[#10B981]' : isMe ? 'bg-brand' : 'bg-gray-600'
                    }`}
                    style={{ width: `${Math.max(4, percentWidth)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
