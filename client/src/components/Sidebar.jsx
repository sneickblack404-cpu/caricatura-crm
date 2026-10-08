import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PhoneCall, 
  Users, 
  BarChart3, 
  CalendarClock, 
  ShieldCheck, 
  Sparkles,
  ArrowLeftRight,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  Edit3
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  onOpenSwitchProfile, 
  onOpenEditProfile,
  onLogout,
  theme = 'dark',
  onToggleTheme,
  whatsappsCount = 3 
}) {
  const isCeo = currentUser?.role === 'admin' || currentUser?.username === 'gustavo';

  // Menu Items: Apenas o Gustavo (CEO) vê Métricas & Lucro!
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vendas', label: 'Vendas', icon: ShoppingBag },
    { id: 'whatsapps', label: 'WhatsApps', icon: PhoneCall, badge: `${whatsappsCount} Zaps` },
    { id: 'followups', label: 'Follow-ups', icon: CalendarClock },
  ];

  // Se for CEO, adiciona abas exclusivas
  if (isCeo) {
    menuItems.push({ id: 'equipe', label: 'Atendentes', icon: Users });
    menuItems.push({ 
      id: 'metricas', 
      label: 'Métricas & Lucro', 
      icon: BarChart3, 
      highlight: true, 
      badge: 'CEO'
    });
  }

  const isDark = theme === 'dark';

  return (
    <aside className={`w-64 border-r flex flex-col justify-between shrink-0 select-none min-h-screen transition-colors ${
      isDark ? 'bg-[#111218] border-[#20222f] text-gray-100' : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <div>
        {/* Logo / Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-[#20222f]' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f5b800] to-[#d49900] flex items-center justify-center shadow-lg shadow-yellow-500/10">
              <Sparkles className="w-4 h-4 text-black font-extrabold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#f5b800]">X1</span>
                <span className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>CRM</span>
              </div>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Caricaturas Zap</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className={`p-4 mx-3 my-3 rounded-2xl border transition ${
          isDark ? 'bg-[#181a24] border-[#272938]' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md text-sm border-2 border-white/20"
              style={{ backgroundColor: currentUser?.color || '#3B82F6' }}
            >
              {currentUser?.avatar || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className={`font-bold text-sm truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {currentUser?.name || 'Usuário'}
                </h4>
                {isCeo && <ShieldCheck className="w-3.5 h-3.5 text-[#f5b800] shrink-0" />}
              </div>
              <p className="text-xs text-gray-400">
                {isCeo ? 'CEO' : 'Atendente'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-black/10 dark:border-white/10">
            {/* Editar próprio perfil */}
            <button
              onClick={onOpenEditProfile}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition ${
                isDark ? 'bg-[#20222e] hover:bg-[#282a3c] text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Personalizar meu nome"
            >
              <Edit3 className="w-3 h-3 text-[#f5b800]" />
              <span>Meu Perfil</span>
            </button>

            {/* Alternar Perfil: VISÍVEL SOMENTE PARA O CEO! */}
            {isCeo ? (
              <button
                onClick={onOpenSwitchProfile}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition ${
                  isDark ? 'bg-[#20222e] hover:bg-[#282a3c] text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                title="Acessar conta de atendente"
              >
                <ArrowLeftRight className="w-3 h-3 text-[#10B981]" />
                <span>Trocar</span>
              </button>
            ) : (
              <div className="text-[10px] text-gray-500 flex items-center justify-center">
                Conta Pessoal
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition group ${
                  isActive
                    ? 'bg-brand font-black shadow-md'
                    : isDark 
                      ? 'text-gray-400 hover:text-gray-100 hover:bg-[#181a24]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition ${isActive ? 'text-inherit' : 'text-gray-400 group-hover:text-gray-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive 
                      ? 'bg-black/20 text-inherit' 
                      : item.highlight ? 'bg-brand/15 text-brand border border-brand/30' : 'bg-[#232635] text-gray-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: Modo Claro/Escuro & Logout */}
      <div className={`p-4 border-t space-y-2 text-xs ${
        isDark ? 'border-[#20222f]' : 'border-gray-200'
      }`}>
        {/* Toggle Modo Claro / Escuro */}
        <button
          onClick={onToggleTheme}
          className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition border ${
            isDark 
              ? 'bg-[#181a24] hover:bg-[#202330] text-gray-300 border-[#272938]' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-[#f5b800]" />
              <span>Modo claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-purple-600" />
              <span>Modo escuro</span>
            </>
          )}
        </button>

        {/* Botão Sair */}
        <button
          onClick={onLogout}
          className="w-full py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-gray-500 hover:text-rose-400 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}
