import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, Smartphone, Edit3 } from 'lucide-react';
import { api } from '../api';

const DEFAULT_LINES = [
  { id: 'wpp-1', name: '+55 27 99245-6099' },
  { id: 'wpp-2', name: '+55 27 99256-4791' },
  { id: 'wpp-3', name: 'Tráfego Direto' }
];

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function EditSaleModal({
  isOpen,
  sale,
  onClose,
  onSaleUpdated,
  users = [],
  whatsapps = [],
  currentUser
}) {
  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();

  const availableLines = React.useMemo(() => {
    let list = (whatsapps && whatsapps.length > 0) ? [...whatsapps] : [...DEFAULT_LINES];
    const hasDirect = list.some(w => w.name?.toLowerCase().includes('direto') || w.id === 'wpp-3');
    if (!hasDirect) {
      list.push({ id: 'wpp-3', name: 'Tráfego Direto', number: '' });
    }
    return list;
  }, [whatsapps]);

  const isCeo = currentUser?.role === 'admin' || currentUser?.username === 'gustavo';
  const [attendantId, setAttendantId] = useState('');
  const [whatsappId, setWhatsappId] = useState('');
  const [amount, setAmount] = useState('');
  const [saleDate, setSaleDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sincroniza campos quando uma venda é aberta para edição
  useEffect(() => {
    if (sale) {
      setAttendantId(sale.attendantId || 'user-gustavo');
      setWhatsappId(sale.whatsappId || availableLines[0]?.id || 'wpp-1');
      setAmount(sale.amount !== undefined ? String(sale.amount) : '');

      // Extrair data da venda
      if (sale.createdAt) {
        try {
          const d = new Date(sale.createdAt);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          setSaleDate(`${y}-${m}-${day}`);
        } catch {
          setSaleDate(todayStr);
        }
      } else {
        setSaleDate(todayStr);
      }

      setError('');
    }
  }, [sale, availableLines, todayStr]);

  if (!isOpen || !sale) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(String(amount).replace(',', '.'));
    if (!numericAmount || numericAmount <= 0) {
      setError('Por favor, informe um valor válido para a venda.');
      return;
    }

    setLoading(true);

    try {
      const chosenLine = availableLines.find(w => w.id === whatsappId) || availableLines[0];

      // Se a data foi alterada, recalcula o timestamp mantendo a hora
      let createdAtIso = sale.createdAt;
      if (saleDate) {
        const [y, m, d] = saleDate.split('-').map(Number);
        const refTime = sale.createdAt ? new Date(sale.createdAt) : new Date();
        const updatedDate = new Date(y, m - 1, d, refTime.getHours(), refTime.getMinutes(), refTime.getSeconds());
        createdAtIso = updatedDate.toISOString();
      }

      const payload = {
        attendantId: attendantId || sale.attendantId,
        whatsappId: chosenLine?.id || 'wpp-1',
        whatsappName: chosenLine?.name || '+55 27 99245-6099',
        amount: numericAmount,
        createdAt: createdAtIso,
        customerName: sale.customerName || 'Cliente Pix',
        profession: sale.profession || 'Caminhoneiro',
        paymentMethod: sale.paymentMethod || 'pix',
        status: sale.status || 'pago'
      };

      await api.updateSale(sale.id, payload);

      if (onSaleUpdated) {
        onSaleUpdated();
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar alterações da venda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#151720] border border-[#272938] w-full max-w-md max-h-[92dvh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold shadow-md shadow-sky-500/10 shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Editar Venda</h3>
              <p className="text-xs text-gray-400">Origem da venda, atendente e valor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#212330] hover:bg-[#2b2e40] text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Vendedor / Atendente */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Vendedor / Atendente
            </label>
            <select
              value={attendantId}
              onChange={(e) => setAttendantId(e.target.value)}
              className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#f5b800]"
            >
              <option value="user-gustavo">⭐ Gustavo Henrick (CEO)</option>
              {users.filter(u => u.id !== 'user-gustavo').map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.title || 'Atendente'})</option>
              ))}
            </select>
          </div>

          {/* Origem da Venda: Linha do WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#10B981]" />
              Linha de Origem da Venda (WhatsApp) *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {availableLines.map(w => {
                const isSelected = whatsappId === w.id;
                return (
                  <button
                    type="button"
                    key={w.id}
                    onClick={() => setWhatsappId(w.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-[#10B981]/15 border-[#10B981] text-white ring-1 ring-[#10B981]'
                        : 'bg-[#1b1d28] border-[#2c2f42] text-gray-300 hover:border-gray-500 hover:bg-[#202230]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-gray-600'}`} />
                      <span className="text-sm font-bold">{w.name}</span>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/20 px-2 py-0.5 rounded-md">
                        Selecionado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data da Venda (Hoje / Ontem / Calendário) */}
          <div className="bg-[#181a24] p-3 rounded-xl border border-[#272938] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#f5b800]" />
                Data da Venda
              </label>
              <span className={`text-[11px] font-bold ${
                saleDate === todayStr 
                  ? 'text-emerald-400' 
                  : saleDate === yesterdayStr 
                    ? 'text-amber-400' 
                    : 'text-blue-400'
              }`}>
                {saleDate === todayStr 
                  ? '🟢 Hoje' 
                  : saleDate === yesterdayStr 
                    ? '🟡 Ontem' 
                    : `📅 ${saleDate.split('-').reverse().join('/')}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSaleDate(todayStr)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  saleDate === todayStr
                    ? 'bg-[#10B981] text-black shadow-md'
                    : 'bg-[#1f212d] hover:bg-[#2b2e40] text-gray-300 border border-[#2c2f42]'
                }`}
              >
                <span>Hoje</span>
              </button>

              <button
                type="button"
                onClick={() => setSaleDate(yesterdayStr)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  saleDate === yesterdayStr
                    ? 'bg-[#f5b800] text-black shadow-md'
                    : 'bg-[#1f212d] hover:bg-[#2b2e40] text-gray-300 border border-[#2c2f42]'
                }`}
              >
                <span>Ontem</span>
              </button>

              <div className="flex-[1.2] relative">
                <input
                  type="date"
                  value={saleDate}
                  max={todayStr}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full bg-[#1f212d] border border-[#2c2f42] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#f5b800] text-center font-mono cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Valor da Venda (R$) */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Valor da Venda (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-lg">R$</span>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl pl-12 pr-4 py-3.5 text-2xl font-black text-white placeholder-gray-600 focus:outline-none focus:border-[#f5b800] focus:ring-1 focus:ring-[#f5b800]"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#212330] hover:bg-[#2b2e40] text-gray-300 font-bold py-3.5 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-[#10B981] hover:bg-[#0ea572] text-black font-black text-base py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
