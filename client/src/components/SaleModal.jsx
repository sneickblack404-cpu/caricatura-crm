import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
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

export default function SaleModal({ 
  isOpen, 
  onClose, 
  onSaleCreated, 
  users = [], 
  whatsapps = [], 
  currentUser 
}) {
  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();
  const [saleDate, setSaleDate] = useState(todayStr);

  const availableLines = React.useMemo(() => {
    let list = (whatsapps && whatsapps.length > 0) ? [...whatsapps] : [...DEFAULT_LINES];
    const hasDirect = list.some(w => w.name?.toLowerCase().includes('direto') || w.id === 'wpp-3');
    if (!hasDirect) {
      list.push({ id: 'wpp-3', name: 'Tráfego Direto', number: '' });
    }
    return list;
  }, [whatsapps]);

  const isCeo = currentUser?.role === 'admin' || currentUser?.username === 'gustavo';
  const [attendantId, setAttendantId] = useState(currentUser?.id || 'user-gustavo');
  const [whatsappId, setWhatsappId] = useState(availableLines[0]?.id || 'wpp-1');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      setAttendantId(currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!whatsappId || !availableLines.some(w => w.id === whatsappId)) {
      setWhatsappId(availableLines[0]?.id || 'wpp-1');
    }
  }, [availableLines, whatsappId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!numericAmount || numericAmount <= 0) {
      setError('Por favor, informe o valor da venda.');
      return;
    }

    setLoading(true);

    try {
      const chosenLine = availableLines.find(w => w.id === whatsappId) || availableLines[0];

      let createdAtIso = new Date().toISOString();
      if (saleDate && saleDate !== todayStr) {
        const [y, m, d] = saleDate.split('-').map(Number);
        const now = new Date();
        const past = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
        createdAtIso = past.toISOString();
      }

      const payload = {
        attendantId: isCeo ? (attendantId || currentUser?.id) : currentUser?.id,
        whatsappId: chosenLine?.id || 'wpp-1',
        whatsappName: chosenLine?.name || '+55 27 99245-6099',
        customerName: 'Cliente Pix',
        amount: numericAmount,
        profession: 'Caminhoneiro',
        customerPhone: '',
        paymentMethod: 'pix',
        notes: '',
        status: 'pago',
        createdAt: createdAtIso
      };

      await api.createSale(payload);

      // Confete animado de celebração
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f5b800', '#10B981', '#3B82F6', '#ffffff']
      });

      // Limpar campos
      setAmount('');
      setSaleDate(todayStr);

      onSaleCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar venda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#151720] border border-[#272938] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f5b800] text-black flex items-center justify-center font-black shadow-md shadow-yellow-500/20">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Registrar Venda</h3>
              <p className="text-xs text-gray-400">Origem da venda e valor (PIX)</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Se for CEO, escolhe quem fez a venda */}
          {isCeo && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Vendedor / Atendente
              </label>
              <select
                value={attendantId}
                onChange={(e) => setAttendantId(e.target.value)}
                className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#f5b800]"
              >
                <option value="user-gustavo">⭐ Gustavo Henrick (CEO - Minha Venda)</option>
                {users.filter(u => u.id !== 'user-gustavo').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.title || 'Atendente'})</option>
                ))}
              </select>
            </div>
          )}

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

          {/* Data da Venda (Hoje / Ontem) */}
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

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f5b800] hover:bg-[#e0a700] text-black font-black text-base py-3.5 rounded-xl shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <span>Registrando...</span>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Confirmar e Registrar Venda</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
