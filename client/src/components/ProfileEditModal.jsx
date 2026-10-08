import React, { useState } from 'react';
import { X, Check, User, Phone, Sparkles, Palette } from 'lucide-react';
import { api } from '../api';

const THEME_COLORS = [
  { id: 'amarelo', label: 'Amarelo (Dourado)', hex: '#f5b800' },
  { id: 'azul', label: 'Azul', hex: '#3b82f6' },
  { id: 'verde', label: 'Verde', hex: '#10b981' },
  { id: 'rosa', label: 'Rosa', hex: '#ec4899' }
];

export default function ProfileEditModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onProfileUpdated,
  currentAccent = 'amarelo',
  onSelectAccent 
}) {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [selectedThemeColor, setSelectedThemeColor] = useState(currentUser?.themeColor || currentAccent || 'amarelo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, digite seu nome.');
      return;
    }

    setLoading(true);
    try {
      const updated = await api.updateUser(currentUser.id, {
        name: name.trim(),
        phone: phone.trim(),
        themeColor: selectedThemeColor
      });

      if (onSelectAccent) {
        onSelectAccent(selectedThemeColor);
      }

      onProfileUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#151720] border border-[#272938] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand text-black flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Editar Meu Perfil</h3>
              <p className="text-xs text-gray-400">Personalize seu nome e sua cor favorita no CRM</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Seu Nome Completo *
            </label>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Seu WhatsApp de Contato
            </label>
            <input
              type="text"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
            />
          </div>

          {/* Escolha da Cor Padrão (Amarelo, Azul, Verde, Rosa) */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-brand" />
              Sua Cor de Destaque no CRM
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEME_COLORS.map((col) => (
                <button
                  type="button"
                  key={col.id}
                  onClick={() => setSelectedThemeColor(col.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition text-left ${
                    selectedThemeColor === col.id
                      ? 'border-brand bg-[#1b1d28] ring-1 ring-brand'
                      : 'border-[#272938] bg-[#181a24] hover:border-[#383c50]'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="text-xs font-bold text-gray-200">{col.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand font-black text-sm py-3.5 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Salvando...</span>
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
