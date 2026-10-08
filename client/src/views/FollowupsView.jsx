import React, { useState } from 'react';
import { CalendarClock, Plus, MessageCircle, Check, Trash2, AlertCircle, X, CheckCircle2, Clock } from 'lucide-react';
import { api, formatPhone } from '../api';

export default function FollowupsView({ followups = [], onReload, users = [], whatsapps = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // Followup selecionado para exclusão
  const [filter, setFilter] = useState('todos'); // 'todos' | 'pendentes' | 'concluidos'

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [profession, setProfession] = useState('Caminhoneiro');
  const [notes, setNotes] = useState('');
  const [attendantId, setAttendantId] = useState(users[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    setLoading(true);
    try {
      await api.createFollowup({
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/\D/g, ''),
        profession: profession.trim() || 'Caminhoneiro',
        notes: notes.trim(),
        attendantId: attendantId || users[0]?.id || 'user-gustavo',
        status: 'pendente',
        dueDate: new Date().toISOString().split('T')[0]
      });

      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setProfession('Caminhoneiro');
      setIsModalOpen(false);
      onReload();
    } catch (err) {
      console.error(err);
      alert('Erro ao criar follow-up. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (fu) => {
    try {
      await api.updateFollowup(fu.id, {
        status: fu.status === 'pendente' ? 'concluido' : 'pendente'
      });
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteFollowup(deleteTarget.id);
      setDeleteTarget(null);
      onReload();
    } catch (err) {
      console.error('Erro ao excluir follow-up:', err);
      alert('Erro ao excluir follow-up. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleClearCompleted = async () => {
    const completedList = followups.filter(f => f.status === 'concluido');
    if (completedList.length === 0) return;

    if (!window.confirm(`Deseja remover todos os ${completedList.length} follow-ups concluídos?`)) {
      return;
    }

    try {
      for (const fu of completedList) {
        await api.deleteFollowup(fu.id);
      }
      onReload();
    } catch (err) {
      console.error(err);
      alert('Erro ao limpar follow-ups concluídos.');
    }
  };

  const pendingCount = followups.filter(f => f.status === 'pendente').length;
  const completedCount = followups.filter(f => f.status === 'concluido').length;

  const filteredFollowups = followups.filter(f => {
    if (filter === 'pendentes') return f.status === 'pendente';
    if (filter === 'concluidos') return f.status === 'concluido';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151720] border border-[#272938] rounded-2xl p-6 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Recuperação de Vendas</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Follow-ups & Retornos no WhatsApp
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Clientes que pediram orçamento de caricatura e aguardam retorno para fechar.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition"
              title="Excluir todos os follow-ups que já foram concluídos"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Concluídos ({completedCount})</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#f5b800] hover:bg-[#e0a700] text-black font-extrabold text-sm px-5 py-3 rounded-xl shadow-lg shadow-yellow-500/20 transition shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Novo Lembrete</span>
          </button>
        </div>
      </div>

      {/* Filtros por status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filter === 'todos'
              ? 'bg-[#1e2230] text-white border border-[#3b4259] shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#181a24]'
          }`}
        >
          <span>Todos</span>
          <span className="px-1.5 py-0.5 rounded-md bg-[#282b3a] text-[10px] text-gray-300">
            {followups.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('pendentes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filter === 'pendentes'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#181a24]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Pendentes</span>
          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-[10px] text-amber-300">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('concluidos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filter === 'concluidos'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#181a24]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Concluídos</span>
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-[10px] text-emerald-300">
            {completedCount}
          </span>
        </button>
      </div>

      {/* Grid de Follow-ups */}
      {filteredFollowups.length === 0 ? (
        <div className="bg-[#151720] border border-[#272938] rounded-2xl p-12 text-center">
          <CalendarClock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-200">
            {filter === 'pendentes'
              ? 'Nenhum follow-up pendente!'
              : filter === 'concluidos'
              ? 'Nenhum follow-up concluído ainda.'
              : 'Nenhum lembrete cadastrado.'}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {filter === 'pendentes'
              ? 'Todos os retornos de clientes estão em dia. Bom trabalho!'
              : 'Cadastre lembretes para não esquecer de mandar mensagem para clientes que pediram orçamento.'}
          </p>
          {filter === 'todos' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5b800] text-black font-bold text-xs hover:bg-[#e0a700] transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Criar primeiro lembrete</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFollowups.map((fu) => {
            const isDone = fu.status === 'concluido';

            return (
              <div
                key={fu.id}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                  isDone
                    ? 'bg-[#12131b] border-[#222432] opacity-70'
                    : 'bg-[#151720] border-[#272938] hover:border-[#383d54] shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 pr-2">
                      <h4 className={`font-bold text-base truncate ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                        {fu.customerName || 'Cliente sem nome'}
                      </h4>
                      {fu.profession && (
                        <span className="text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 inline-block mt-1">
                          {fu.profession}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Botão Concluir / Reabrir */}
                      <button
                        onClick={() => handleToggle(fu)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                          isDone
                            ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                            : 'bg-[#20222f] text-gray-400 hover:text-white border border-[#2d3042] hover:border-emerald-500/40 hover:bg-emerald-500/10'
                        }`}
                        title={isDone ? 'Reabrir follow-up' : 'Marcar como concluído'}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Botão Remover Follow-up */}
                      <button
                        onClick={() => setDeleteTarget(fu)}
                        className="w-8 h-8 rounded-xl bg-[#20222f] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-[#2d3042] hover:border-rose-500/30 flex items-center justify-center transition"
                        title="Remover / Excluir follow-up"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 bg-[#181a24] p-3 rounded-xl border border-[#252837] my-3 leading-relaxed break-words">
                    {fu.notes || 'Sem observações cadastradas.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#20222f] text-xs">
                  <span className="text-gray-400 font-mono">
                    {fu.customerPhone ? formatPhone(fu.customerPhone) : 'Sem número'}
                  </span>

                  {fu.customerPhone ? (
                    <a
                      href={`https://wa.me/55${fu.customerPhone.replace(/\D/g, '')}?text=Ol%C3%A1+${encodeURIComponent(fu.customerName || '')}%2C+tudo+bem%3F+Conseguiu+dar+uma+olhadinha+nas+amostras+de+caricatura+que+te+mandei%3F`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-black" />
                      <span>Chamar no Zap</span>
                    </a>
                  ) : (
                    <span className="text-gray-500 text-[11px]">Sem WhatsApp</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#151720] border border-[#272938] w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-white">Excluir Follow-up?</h3>
              <p className="text-xs text-gray-400">
                Tem certeza que deseja remover o lembrete de{' '}
                <strong className="text-gray-200">"{deleteTarget.customerName}"</strong>?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#2e3144] hover:bg-[#1f212f] text-gray-300 font-semibold text-xs transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Lembrete */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#151720] border border-[#272938] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27]">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#f5b800]" />
                <h3 className="font-bold text-base text-white">Criar Lembrete de Follow-up</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#212330] hover:bg-[#2b2e40] text-gray-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Oliveira"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">WhatsApp do Cliente *</label>
                <input
                  type="text"
                  placeholder="(27) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Profissão / Tema (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Caminhoneiro, Freteiro, Pedreiro..."
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Observações do que combinaram</label>
                <textarea
                  rows="2"
                  placeholder="Ex: Pediu para retornar na sexta quando sai o pagamento"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                />
              </div>

              {users.length > 1 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Atendente Responsável</label>
                  <select
                    value={attendantId}
                    onChange={(e) => setAttendantId(e.target.value)}
                    className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f5b800] hover:bg-[#e0a700] text-black font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-yellow-500/20 transition disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Lembrete'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
