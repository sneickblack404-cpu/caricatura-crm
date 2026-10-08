import React, { useState } from 'react';
import { Phone, Plus, MessageSquare, ExternalLink, Check, Trash2, Edit3, ShieldAlert } from 'lucide-react';
import { api, formatCurrency, formatPhone } from '../api';

export default function WhatsappsView({ whatsapps = [], onReload, metrics }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10B981');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colorOptions = [
    { label: 'Verde', hex: '#10B981' },
    { label: 'Azul', hex: '#3B82F6' },
    { label: 'Rosa', hex: '#EC4899' },
    { label: 'Roxo', hex: '#8B5CF6' },
    { label: 'Amarelo', hex: '#F59E0B' },
    { label: 'Ciano', hex: '#06B6D4' }
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const cleanNum = number.replace(/\D/g, '');
    if (!name.trim()) {
      setError('Por favor, informe o nome da linha de WhatsApp.');
      return;
    }
    if (cleanNum.length < 10) {
      setError('Por favor, informe um número de WhatsApp válido com DDD.');
      return;
    }

    setLoading(true);
    try {
      await api.createWhatsapp({
        name: name.trim(),
        number: cleanNum,
        description: description.trim(),
        color
      });

      setName('');
      setNumber('');
      setDescription('');
      setIsModalOpen(false);
      onReload();
    } catch (err) {
      console.error(err);
      setError('Erro ao adicionar número de WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (wpp) => {
    try {
      await api.updateWhatsapp(wpp.id, { active: !wpp.active });
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151720] border border-[#272938] rounded-2xl p-6 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Multi-WhatsApp</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Gerenciamento de Linhas do WhatsApp
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Você tem <strong>{whatsapps.length} WhatsApps cadastrados</strong>. Adicione novos números conforme sua equipe e campanhas crescerem.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#f5b800] hover:bg-[#e0a700] text-black font-extrabold text-sm px-5 py-3 rounded-xl shadow-lg shadow-yellow-500/20 transition shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Adicionar WhatsApp</span>
        </button>
      </div>

      {/* Lista de Cartões de WhatsApp */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {whatsapps.map((wpp, index) => {
          // Métricas deste WhatsApp
          const zapMetrics = metrics?.salesByWhatsapp?.find(s => s.id === wpp.id);
          const salesTotal = zapMetrics?.grossAmount || 0;
          const salesCount = zapMetrics?.salesCount || 0;

          return (
            <div
              key={wpp.id}
              className={`bg-[#151720] border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition ${
                wpp.active ? 'border-[#272938] hover:border-[#383d54]' : 'border-red-900/30 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0"
                      style={{ backgroundColor: `${wpp.color || '#10B981'}25`, color: wpp.color || '#10B981' }}
                    >
                      <Phone className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{wpp.name}</h4>
                        <span className="text-[10px] font-mono bg-[#1c1e2a] px-1.5 py-0.5 rounded text-gray-400">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-400 font-mono mt-0.5 font-semibold">
                        {wpp.number ? formatPhone(wpp.number) : 'Checkout Direto (Sem WhatsApp)'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Ativo */}
                  <button
                    onClick={() => handleToggleActive(wpp)}
                    title={wpp.active ? 'Desativar linha' : 'Ativar linha'}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${
                      wpp.active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {wpp.active ? 'ATIVO' : 'PAUSADO'}
                  </button>
                </div>

                {wpp.description && (
                  <p className="text-xs text-gray-400 bg-[#181a24] p-2.5 rounded-xl border border-[#252837] mb-4">
                    {wpp.description}
                  </p>
                )}

                {/* Desempenho do Zap */}
                <div className="grid grid-cols-2 gap-2 bg-[#12131b] p-3 rounded-xl border border-[#20222e] mb-4">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold">Faturamento</span>
                    <span className="text-sm font-black text-[#f5b800]">{formatCurrency(salesTotal)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold">Vendas Feitas</span>
                    <span className="text-sm font-black text-white">{salesCount} caricaturas</span>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#20222f]">
                {wpp.number ? (
                  <a
                    href={`https://wa.me/55${wpp.number.replace(/\D/g, '').replace(/^55/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-[#1e202e] hover:bg-[#272a3d] text-xs font-semibold text-gray-200 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition border border-[#2c2f42]"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Abrir no Zap</span>
                  </a>
                ) : (
                  <div className="flex-1 bg-[#181a24] text-xs font-semibold text-amber-400 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-[#272938]">
                    <span>⚡ Origem: Tráfego Direto</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Adicionar WhatsApp */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#151720] border border-[#272938] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#10B981] text-black flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Adicionar Linha de WhatsApp</h3>
                  <p className="text-xs text-gray-400">Cadastre um novo número de atendimento</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nome da Linha / Identificação *
                </label>
                <input
                  type="text"
                  placeholder="Ex: WhatsApp 04 - Atendente Lucas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Número do WhatsApp (com DDD) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: (11) 98765-4321 ou 11987654321"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Descrição / Finalidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tráfego pago direto do anúncio de formaturas"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5b800]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Cor da Etiqueta
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button
                      type="button"
                      key={c.hex}
                      onClick={() => setColor(c.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        color === c.hex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f5b800] hover:bg-[#e0a700] text-black font-extrabold text-sm py-2.5 rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Novo WhatsApp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
