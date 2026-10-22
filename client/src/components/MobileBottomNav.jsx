import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  BarChart3, 
  CalendarClock, 
  Menu,
  Plus
} from 'lucide-react';

export default function MobileBottomNav({
  currentTab,
  setCurrentTab,
  isCeo,
  onOpenSaleModal,
  onOpenMobileMenu,
  theme = 'dark'
}) {
  const isDark = theme === 'dark';

  return (
    <nav 
      aria-label="Navegação Inferior Mobile"
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t safe-area-pb backdrop-blur-xl transition-colors ${
        isDark 
          ? 'bg-[#111218]/95 border-[#20222f] text-gray-400' 
          : 'bg-white/95 border-gray-200 text-gray-600 shadow-lg'
      }`}
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
        {/* Dashboard */}
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition relative ${
            currentTab === 'dashboard'
              ? 'text-brand font-black'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Início</span>
          {currentTab === 'dashboard' && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand absolute -bottom-0.5" />
          )}
        </button>

        {/* Vendas */}
        <button
          onClick={() => setCurrentTab('vendas')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition relative ${
            currentTab === 'vendas'
              ? 'text-brand font-black'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${currentTab === 'vendas' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Vendas</span>
          {currentTab === 'vendas' && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand absolute -bottom-0.5" />
          )}
        </button>

        {/* BOTÃO CENTRAL DESTACADO: + VENDA */}
        <div className="flex flex-col items-center justify-center px-1">
          <button
            onClick={onOpenSaleModal}
            className="w-12 h-12 -mt-5 rounded-2xl bg-brand text-black flex items-center justify-center shadow-lg shadow-yellow-500/30 active:scale-95 transition-transform"
            aria-label="Registrar Nova Venda"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[10px] mt-0.5 font-bold text-gray-200">Venda</span>
        </div>

        {/* Métricas (CEO) ou Follow-ups (Atendente) */}
        {isCeo ? (
          <button
            onClick={() => setCurrentTab('metricas')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition relative ${
              currentTab === 'metricas'
                ? 'text-brand font-black'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${currentTab === 'metricas' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Lucro</span>
            {currentTab === 'metricas' && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand absolute -bottom-0.5" />
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentTab('followups')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition relative ${
              currentTab === 'followups'
                ? 'text-brand font-black'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <CalendarClock className={`w-5 h-5 ${currentTab === 'followups' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Retornos</span>
            {currentTab === 'followups' && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand absolute -bottom-0.5" />
            )}
          </button>
        )}

        {/* Menu Completo (Abre Drawer Lateral) */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 text-gray-400 hover:text-gray-200 transition"
        >
          <Menu className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-1 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
