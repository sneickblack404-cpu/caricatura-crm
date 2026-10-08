import React from 'react';
import { X, Check, ShieldCheck, User, Users } from 'lucide-react';

export default function ProfileSwitchModal({ 
  isOpen, 
  onClose, 
  users = [], 
  currentUser, 
  onSelectUser 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#151720] border border-[#272938] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f5b800] text-black flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Alternar Perfil Ativo</h3>
              <p className="text-xs text-gray-400">Selecione para entrar como Dono ou Atendente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#212330] hover:bg-[#2b2e40] text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User list */}
        <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {users.map((u) => {
            const isSelected = currentUser?.id === u.id;
            const isAdmin = u.role === 'admin';

            return (
              <button
                key={u.id}
                onClick={() => {
                  onSelectUser(u);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition text-left ${
                  isSelected
                    ? 'bg-[#222433] border-[#f5b800] shadow-md ring-1 ring-[#f5b800]/30'
                    : 'bg-[#181a24] border-[#252837] hover:border-[#383c52]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow text-sm border border-white/10"
                    style={{ backgroundColor: u.color || '#3B82F6' }}
                  >
                    {u.avatar || u.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-gray-100">{u.name}</span>
                      {isAdmin && (
                        <span className="bg-[#f5b800]/20 text-[#f5b800] text-[10px] px-1.5 py-0.5 rounded font-bold border border-[#f5b800]/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          ADMIN
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {isAdmin ? 'Visão Executiva, Faturamento & Lucro' : `Atendente · ${u.commissionRate}% de comissão`}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#f5b800] text-black flex items-center justify-center font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
