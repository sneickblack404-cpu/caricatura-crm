import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, Cpu, Smartphone, Laptop, UserCheck, HelpCircle } from 'lucide-react';
import { api } from '../api';

const CATEGORIES = [
  { id: 'ia', label: '🤖 IA', desc: 'Inteligência Artificial' },
  { id: 'chip', label: '📱 Chip', desc: 'Chip / WhatsApp' },
  { id: 'ferramenta', label: '💻 Ferramenta', desc: 'Ferramentas & Softwares' },
  { id: 'pagamento_atendente', label: '👤 Pagamento do Atendente', desc: 'Repasse / Pagamento' },
  { id: 'outro', label: '📦 Outro', desc: 'Outro Custo' }
];

export default function ExpenseModal({ isOpen, onClose, onExpenseSaved, expenseToEdit = null, users = [] }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('ia');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAttendant, setSelectedAttendant] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attendantsList, setAttendantsList] = useState(users || []);

  useEffect(() => {
    if (!isOpen) return;

    if (users && users.length > 0) {
      setAttendantsList(users);
    } else {
      api.getUsers()
        .then(res => setAttendantsList(res || []))
        .catch(() => {});
    }

    if (expenseToEdit) {
      setAmount(String(expenseToEdit.amount || ''));
      let cat = expenseToEdit.category || 'ia';
      if (cat === 'software') cat = 'ferramenta';
      setCategory(cat);
      setDate(expenseToEdit.date || new Date().toISOString().split('T')[0]);
      setNotes(expenseToEdit.notes || '');

      if (cat === 'pagamento_atendente') {
        const titleClean = (expenseToEdit.title || '').replace('Pagamento Atendente: ', '').trim();
        setSelectedAttendant(titleClean);
      } else if (cat === 'outro') {
        setOtherDescription(expenseToEdit.title || '');
      }
    } else {
      setAmount('');
      setCategory('ia');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedAttendant(users && users[0] ? users[0].name : 'David Marques');
      setOtherDescription('');
      setNotes('');
    }
    setError('');
  }, [isOpen, expenseToEdit, users]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(String(amount).replace(',', '.'));
    if (!numericAmount || numericAmount <= 0) {
      setError('Por favor, informe um valor válido.');
      return;
    }

    if (category === 'outro' && !otherDescription.trim()) {
      setError('Por favor, informe qual é o gasto no campo "Qual?".');
      return;
    }

    let generatedTitle = '';
    if (category === 'ia') {
      generatedTitle = 'Gasto com IA';
    } else if (category === 'chip') {
      generatedTitle = 'Chip / WhatsApp';
    } else if (category === 'ferramenta') {
      generatedTitle = 'Ferramenta';
    } else if (category === 'pagamento_atendente') {
      generatedTitle = `Pagamento Atendente: ${selectedAttendant || 'Atendente'}`;
    } else if (category === 'outro') {
      generatedTitle = otherDescription.trim() || 'Outro Gasto';
    }

    setLoading(true);
    try {
      const payload = {
        title: generatedTitle,
        amount: numericAmount,
        category,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes.trim()
      };

      if (expenseToEdit?.id) {
        await api.updateExpense(expenseToEdit.id, payload);
      } else {
        await api.createExpense(payload);
      }

      if (onExpenseSaved) await onExpenseSaved();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar gasto:', err);
      setError('Erro ao salvar o gasto. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#151720] border border-[#272938] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black">
              <DollarSign className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {expenseToEdit ? 'Editar Gasto' : 'Registrar Gasto'}
              </h3>
              <p className="text-xs text-gray-400">Abate automaticamente do Lucro Líquido Real</p>
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

          {/* Valor (R$) e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">R$</span>
                <input
                  type="text"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl pl-10 pr-3 py-2.5 text-lg font-black text-white focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Data do Gasto
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Categoria do Gasto (IA, Chip, Ferramenta, Pagamento Atendente, Outro) */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Categoria
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${
                    category === cat.id
                      ? 'border-brand bg-brand/15 text-brand ring-1 ring-brand/40 shadow-sm'
                      : 'border-[#272938] bg-[#181a24] text-gray-300 hover:text-white hover:bg-[#1e202e]'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Opção Específica se for Pagamento do Atendente */}
          {category === 'pagamento_atendente' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-amber-300">
                👤 Qual atendente?
              </label>
              <select
                value={selectedAttendant}
                onChange={(e) => setSelectedAttendant(e.target.value)}
                className="w-full bg-[#1b1d28] border border-amber-500/40 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-brand cursor-pointer"
              >
                {attendantsList.map(u => (
                  <option key={u.id || u.name} value={u.name}>
                    {u.name} {u.role === 'admin' ? '(Admin/Gustavo)' : '(Atendente)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Opção Específica se for Outro */}
          {category === 'outro' && (
            <div className="p-3 bg-[#181a24] border border-[#2e3146] rounded-xl space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-gray-300">
                📦 Qual? (Especifique o gasto) *
              </label>
              <input
                type="text"
                placeholder="Ex: Internet, Energia, Embalagem, Café..."
                value={otherDescription}
                onChange={(e) => setOtherDescription(e.target.value)}
                required
                className="w-full bg-[#13141d] border border-[#34374c] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand"
              />
            </div>
          )}

          {/* Informação / Observações */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Informação / Observações (Opcional)
            </label>
            <textarea
              rows="2"
              placeholder="Ex: Pago via Pix, detalhes da cobrança..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[11px] text-purple-300 flex items-start gap-2">
            <span>💡 Deduzido diretamente do cálculo do <strong>Lucro Líquido Real</strong>.</span>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand font-black text-sm py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-black disabled:opacity-50 active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{loading ? 'Salvando...' : (expenseToEdit ? 'Salvar Alterações' : 'Salvar Gasto')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
