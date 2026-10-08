import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Phone, 
  ExternalLink, 
  Trash2, 
  Edit3,
  Briefcase, 
  CreditCard,
  Plus
} from 'lucide-react';
import { api, formatCurrency, formatPhone } from '../api';
import EditSaleModal from '../components/EditSaleModal';

export default function SalesListView({ 
  sales = [], 
  users = [], 
  whatsapps = [], 
  onOpenSaleModal, 
  onReload,
  currentUser
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttendant, setSelectedAttendant] = useState('all');
  const [selectedWhatsapp, setSelectedWhatsapp] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [editingSale, setEditingSale] = useState(null);

  // Filtragem
  const filteredSales = sales.filter((s) => {
    if (selectedAttendant !== 'all' && s.attendantId !== selectedAttendant) return false;
    if (selectedWhatsapp !== 'all' && s.whatsappId !== selectedWhatsapp) return false;
    if (selectedPayment !== 'all' && s.paymentMethod !== selectedPayment) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = s.customerName?.toLowerCase().includes(term);
      const matchProf = s.profession?.toLowerCase().includes(term);
      const matchPhone = s.customerPhone?.includes(term);
      const matchAtt = s.attendantName?.toLowerCase().includes(term);
      const matchNotes = s.notes?.toLowerCase().includes(term);
      return matchName || matchProf || matchPhone || matchAtt || matchNotes;
    }
    return true;
  });

  const totalFiltered = filteredSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro de venda?')) return;
    setDeletingId(id);
    try {
      await api.deleteSale(id);
      onReload();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const getPaymentBadge = (method) => {
    switch (method) {
      case 'pix':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded">PIX</span>;
      case 'cartao_vista':
        return <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[11px] font-bold px-2 py-0.5 rounded">Cartão 1x</span>;
      case 'cartao_parcelado':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[11px] font-bold px-2 py-0.5 rounded">Parcelado</span>;
      case 'boleto':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold px-2 py-0.5 rounded">Boleto</span>;
      default:
        return <span className="bg-gray-700 text-gray-300 text-[11px] font-bold px-2 py-0.5 rounded">{method}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151720] border border-[#272938] rounded-2xl p-6 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4 text-[#f5b800]" />
            <span className="text-xs font-bold text-[#f5b800] uppercase tracking-wider">Histórico Geral</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Todas as Vendas de Caricaturas
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            <strong>{filteredSales.length} vendas</strong> encontradas | Total: <strong className="text-[#f5b800]">{formatCurrency(totalFiltered)}</strong>
          </p>
        </div>

        <button
          onClick={onOpenSaleModal}
          className="flex items-center gap-2 bg-[#f5b800] hover:bg-[#e0a700] text-black font-extrabold text-sm px-5 py-3 rounded-xl shadow-lg shadow-yellow-500/20 transition shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Registrar Venda</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[#151720] border border-[#272938] rounded-2xl p-4 shadow-md grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Busca por texto */}
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, profissão ou fone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181a24] border border-[#2c2f42] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f5b800]"
          />
        </div>

        {/* Filtro Atendente */}
        <div>
          <select
            value={selectedAttendant}
            onChange={(e) => setSelectedAttendant(e.target.value)}
            className="w-full bg-[#181a24] border border-[#2c2f42] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#f5b800]"
          >
            <option value="all">Todos os Vendedores</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} {u.role === 'admin' ? '(CEO)' : ''}</option>
            ))}
          </select>
        </div>

        {/* Filtro WhatsApp */}
        <div>
          <select
            value={selectedWhatsapp}
            onChange={(e) => setSelectedWhatsapp(e.target.value)}
            className="w-full bg-[#181a24] border border-[#2c2f42] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#f5b800]"
          >
            <option value="all">Todas as Linhas WhatsApp</option>
            {whatsapps.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* Filtro Pagamento */}
        <div>
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="w-full bg-[#181a24] border border-[#2c2f42] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#f5b800]"
          >
            <option value="all">Todas Formas de Pagamento</option>
            <option value="pix">PIX</option>
            <option value="cartao_vista">Cartão à Vista</option>
            <option value="cartao_parcelado">Cartão Parcelado</option>
            <option value="boleto">Boleto</option>
          </select>
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-[#151720] border border-[#272938] rounded-2xl shadow-lg overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            Nenhuma venda corresponde aos filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#181a24] text-xs font-semibold text-gray-400 border-b border-[#272938]">
                <tr>
                  <th className="py-3 px-4">Data/Hora</th>
                  <th className="py-3 px-4">Cliente & WhatsApp</th>
                  <th className="py-3 px-4">Profissão / Tema</th>
                  <th className="py-3 px-4">Atendente</th>
                  <th className="py-3 px-4">Linha Zap</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4">Observação</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212330]">
                {filteredSales.map((sale) => {
                  const date = new Date(sale.createdAt);
                  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={sale.id} className="hover:bg-[#181a24]/50 transition">
                      <td className="py-3.5 px-4 text-xs text-gray-400 whitespace-nowrap">
                        <span className="font-semibold text-gray-200 block">{dateStr}</span>
                        <span>{timeStr}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{sale.customerPhone ? formatPhone(sale.customerPhone) : 'Cliente'}</div>
                        {sale.customerPhone && (
                          <a
                            href={`https://wa.me/55${sale.customerPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Abrir WhatsApp</span>
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-[#242738] text-gray-200 text-xs px-2.5 py-1 rounded-lg border border-[#32364c] font-medium inline-block">
                          {sale.profession}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-300 text-xs">{sale.attendantName}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {sale.whatsappId === 'wpp-3' || sale.whatsappName?.toLowerCase().includes('direto') ? (
                          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md inline-block">
                            ⚡ Tráfego Direto
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 font-mono font-medium truncate max-w-[140px] block">
                            {sale.whatsappName?.replace('WhatsApp ', '')}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {getPaymentBadge(sale.paymentMethod)}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-400 max-w-[180px] truncate" title={sale.notes}>
                        <span>{sale.notes || '—'}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-base text-[#f5b800]">
                          {formatCurrency(sale.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingSale(sale)}
                            title="Editar venda"
                            className="w-7 h-7 rounded-lg bg-[#20222f] hover:bg-sky-500/20 text-gray-400 hover:text-sky-400 flex items-center justify-center transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id)}
                            disabled={deletingId === sale.id}
                            title="Excluir venda"
                            className="w-7 h-7 rounded-lg bg-[#20222f] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Edição de Venda */}
      {editingSale && (
        <EditSaleModal
          isOpen={!!editingSale}
          sale={editingSale}
          onClose={() => setEditingSale(null)}
          onSaleUpdated={() => {
            setEditingSale(null);
            onReload();
          }}
          users={users}
          whatsapps={whatsapps}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
