import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Briefcase, Phone, CreditCard, Calendar, Edit3, Trash2 } from 'lucide-react';
import { api } from '../api';

const PROFESSIONS = [
  'Caminhoneiro',
  'Freteiro',
  'Pedreiro',
  'Outro'
];

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

  const [attendantId, setAttendantId] = useState('');
  const [whatsappId, setWhatsappId] = useState('');
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('Caminhoneiro');
  const [customProfession, setCustomProfession] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [notes, setNotes] = useState('');
  const [saleDate, setSaleDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sincroniza campos quando uma venda é selecionada para edição
  useEffect(() => {
    if (sale) {
      setAttendantId(sale.attendantId || users[0]?.id || 'user-gustavo');
      setWhatsappId(sale.whatsappId || availableLines[0]?.id || 'wpp-1');
      setAmount(sale.amount !== undefined ? String(sale.amount) : '');
      setCustomerName(sale.customerName || '');
      
      const isKnownProf = PROFESSIONS.slice(0, 3).includes(sale.profession);
      if (isKnownProf) {
        setSelectedProfession(sale.profession);
        setCustomProfession('');
      } else {
        setSelectedProfession('Outro');
        setCustomProfession(sale.profession || '');
      }

      // Formatar telefone se tiver
      if (sale.customerPhone) {
        let val = sale.customerPhone.replace(/\D/g, '');
        if (val.length === 11) {
          setCustomerPhone(`(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`);
        } else if (val.length === 10) {
          setCustomerPhone(`(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`);
        } else {
          setCustomerPhone(sale.customerPhone);
        }
      } else {
        setCustomerPhone('');
      }

      setPaymentMethod(sale.paymentMethod || 'pix');
      setNotes(sale.notes || '');

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
  }, [sale, users, availableLines]);

  if (!isOpen || !sale) return null;

  const isCeo = currentUser?.role === 'admin' || currentUser?.username === 'gustavo';
  const selectedWpp = availableLines.find(w => w.id === whatsappId) || availableLines[0];
  const isDirect = selectedWpp?.name?.toLowerCase().includes('direto') || whatsappId === 'wpp-3';

  // Formatação de telefone
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    setCustomerPhone(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(String(amount).replace(',', '.'));
    if (!numericAmount || numericAmount <= 0) {
      setError('Informe o valor válido da venda.');
      return;
    }

    const professionFinal = selectedProfession === 'Outro' ? customProfession : selectedProfession;
    if (!professionFinal.trim()) {
      setError('Por favor, informe a profissão do cliente.');
      return;
    }

    setLoading(true);

    try {
      const chosenLine = availableLines.find(w => w.id === whatsappId) || availableLines[0];

      // Se a data foi alterada, recalcula o timestamp com a hora original da venda ou hora atual
      let createdAtIso = sale.createdAt;
      const originalDateStr = sale.createdAt ? new Date(sale.createdAt).toISOString().slice(0, 10) : '';
      if (saleDate !== originalDateStr) {
        const [y, m, d] = saleDate.split('-').map(Number);
        const refTime = sale.createdAt ? new Date(sale.createdAt) : new Date();
        const updatedDate = new Date(y, m - 1, d, refTime.getHours(), refTime.getMinutes(), refTime.getSeconds());
        createdAtIso = updatedDate.toISOString();
      }

      const payload = {
        attendantId,
        whatsappId: chosenLine?.id || 'wpp-1',
        whatsappName: chosenLine?.name || '+55 27 99245-6099',
        customerName: customerName.trim() || undefined,
        amount: numericAmount,
        profession: professionFinal.trim(),
        customerPhone: customerPhone,
        paymentMethod,
        notes: notes.trim(),
        status: sale.status || 'pago',
        createdAt: createdAtIso
      };

      await api.updateSale(sale.id, payload);

      if (onSaleUpdated) {
        onSaleUpdated();
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar a venda. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#151720] border border-[#272938] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Editar Registro de Venda</h3>
              <p className="text-xs text-gray-400">Altere o valor, atendente, canal ou data da venda</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Vendedor e Linha de Origem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Vendedor / Atendente
              </label>
              <select
                value={attendantId}
                onChange={(e) => setAttendantId(e.target.value)}
                className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f5b800]"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.role === 'admin' ? '(CEO)' : `(${u.title || 'Atendente'})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Linha do WhatsApp / Origem
              </label>
              <select
                value={whatsappId}
                onChange={(e) => setWhatsappId(e.target.value)}
                className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f5b800]"
              >
                {availableLines.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Data da Venda */}
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
                  ? '🟢 Venda de Hoje' 
                  : saleDate === yesterdayStr 
                    ? '🟡 Venda de Ontem' 
                    : `📅 Venda em ${saleDate.split('-').reverse().join('/')}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSaleDate(todayStr)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
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
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
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
                  className="w-full bg-[#1f212d] border border-[#2c2f42] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#f5b800] text-center font-mono cursor-pointer"
                />
              </div>
            </div>

            {saleDate !== todayStr && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 font-medium flex items-center gap-1.5 animate-fadeIn">
                <span>⏰</span>
                <span>
                  Esta venda será contabilizada no dia <strong>{saleDate === yesterdayStr ? 'de Ontem' : saleDate.split('-').reverse().join('/')}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Nome do Cliente */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Nome do Cliente
            </label>
            <input
              type="text"
              placeholder="Ex: Anibal, Marcelo, José..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f5b800]"
            />
          </div>

          {/* Valor da Venda */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Valor da Venda (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-base">R$</span>
              <input
                type="text"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl pl-11 pr-4 py-3 text-xl font-black text-white placeholder-gray-600 focus:outline-none focus:border-[#f5b800]"
              />
            </div>
          </div>

          {/* Profissão do Cliente */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#f5b800]" />
              Profissão do Cliente *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {PROFESSIONS.map((prof) => (
                <button
                  type="button"
                  key={prof}
                  onClick={() => setSelectedProfession(prof)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    selectedProfession === prof
                      ? 'bg-[#f5b800] text-black border-[#f5b800] shadow-sm'
                      : 'bg-[#1b1d28] text-gray-300 border-[#2c2f42] hover:bg-[#252838]'
                  }`}
                >
                  {prof}
                </button>
              ))}
            </div>

            {selectedProfession === 'Outro' && (
              <input
                type="text"
                placeholder="Digite qual a profissão (ex: Mecânico, Eletricista...)"
                value={customProfession}
                onChange={(e) => setCustomProfession(e.target.value)}
                required
                className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f5b800] animate-fadeIn"
              />
            )}
          </div>

          {/* Número do cliente */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#10B981]" />
                Número do WhatsApp do Cliente {isDirect ? '(Opcional)' : '*'}
              </span>
              {isDirect && (
                <span className="text-[11px] text-[#f5b800] font-semibold">Tráfego Direto (Sem WhatsApp obrigatório)</span>
              )}
            </label>
            <input
              type="text"
              placeholder="(11) 99999-9999"
              value={customerPhone}
              onChange={handlePhoneChange}
              required={!isDirect}
              className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f5b800]"
            />
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#3B82F6]" />
              Forma de Pagamento *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'pix', label: 'PIX' },
                { id: 'cartao_vista', label: 'Cartão 1x' },
                { id: 'cartao_parcelado', label: 'Parcelado' },
                { id: 'boleto', label: 'Boleto' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    paymentMethod === m.id
                      ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-sm'
                      : 'bg-[#1b1d28] text-gray-300 border-[#2c2f42] hover:bg-[#252838]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Observação do Pedido (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Foto de caminhão azul com carreta, entrega urgente"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f5b800]"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-[#1e202e] hover:bg-[#292c3f] text-gray-300 font-bold text-sm py-3 rounded-xl border border-[#2c2f42] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-brand font-black text-sm py-3 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Salvando alterações...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
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
