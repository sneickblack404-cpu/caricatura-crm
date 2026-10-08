import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SaleModal from './components/SaleModal';
import ProfileSwitchModal from './components/ProfileSwitchModal';
import ProfileEditModal from './components/ProfileEditModal';
import ExpenseModal from './components/ExpenseModal';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import AdminMetricsView from './views/AdminMetricsView';
import SalesListView from './views/SalesListView';
import WhatsappsView from './views/WhatsappsView';
import TeamView from './views/TeamView';
import FollowupsView from './views/FollowupsView';
import { api } from './api';

export default function App() {
  // Autenticação com sessão no localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Tema Escuro / Claro
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('crm_theme') || 'dark';
  });

  // Cor de Destaque / Tema (amarelo, azul, verde, rosa)
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('crm_accent') || 'amarelo';
  });

  const handleSelectAccent = (colorId) => {
    setAccentColor(colorId);
    localStorage.setItem('crm_accent', colorId);
  };

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [period, setPeriod] = useState('hoje');
  const todayStr = new Date().toISOString().split('T')[0];
  const [customStartDate, setCustomStartDate] = useState(todayStr);
  const [customEndDate, setCustomEndDate] = useState(todayStr);
  const [whatsappFilter, setWhatsappFilter] = useState('all');

  const latestRequestIdRef = useRef(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [users, setUsers] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);

  const [sales, setSales] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isCeo = currentUser?.role === 'admin' || currentUser?.username === 'gustavo';

  // Salvar sessão
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('crm_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('crm_session');
    setCurrentTab('dashboard');
  };

  // Alternar Tema
  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('crm_theme', next);
  };

  // Período formatado
  const periodLabels = {
    hoje: 'Hoje',
    ontem: 'Ontem',
    '7d': '7 dias',
    '15d': '15 dias',
    '30d': '30 dias',
    este_mes: 'Este mês',
    mes_passado: 'Mês passado',
    '3_meses': '3 meses',
    ano: 'Este ano'
  };

  const getPeriodLabel = () => {
    if (period === 'personalizado') {
      if (!customStartDate && !customEndDate) return 'Personalizado';
      const formatBR = (s) => s.split('-').reverse().slice(0, 2).join('/');
      if (customStartDate === customEndDate) {
        const [y, m, d] = customStartDate.split('-');
        return `Dia ${d}/${m}`;
      }
      return `${formatBR(customStartDate)} a ${formatBR(customEndDate)}`;
    }
    return periodLabels[period] || 'Hoje';
  };

  // Carregar dados de inicialização
  const loadInitialData = async () => {
    try {
      const data = await api.getBootstrap();
      setUsers(data.users || []);
      setWhatsapps(data.whatsapps || []);
    } catch (err) {
      console.error('Erro ao carregar bootstrap:', err);
    }
  };

  const handleSetCustomDates = (start, end) => {
    setCustomStartDate(start);
    setCustomEndDate(end || start);
    setPeriod('personalizado');
  };

  // Atualizar dados com proteção contra race conditions
  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    const reqId = ++latestRequestIdRef.current;
    setIsRefreshing(true);

    try {
      const params = {
        period,
        whatsappId: whatsappFilter,
        requesterId: currentUser.id
      };
      if (period === 'personalizado') {
        if (customStartDate) params.startDate = customStartDate;
        if (customEndDate) params.endDate = customEndDate;
      }

      const [metricsData, salesData, followupsData] = await Promise.all([
        api.getMetrics(params),
        api.getSales(params),
        api.getFollowups()
      ]);

      // Se uma nova seleção de data já foi disparada pelo usuário enquanto essa requisição carregava,
      // descarte este resultado para não ficar trocando/piscando na tela!
      if (reqId !== latestRequestIdRef.current) {
        return;
      }

      setMetrics(metricsData);
      setSales(salesData || []);
      setFollowups(followupsData || []);
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
    } finally {
      if (reqId === latestRequestIdRef.current) {
        setIsRefreshing(false);
        setLoading(false);
      }
    }
  }, [period, whatsappFilter, currentUser, customStartDate, customEndDate]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    refreshData();

    // Sincronização em segundo plano suave a cada 15 segundos
    const interval = setInterval(() => {
      refreshData();
    }, 15000);

    // Atualiza apenas quando o usuário volta de outra aba/app (sem disparar em cliques na tela)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData]);

  // Sincronizar classe no elemento raiz html
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Se o usuário não for CEO e estiver em aba restrita, redireciona para dashboard
  useEffect(() => {
    if (!isCeo && (currentTab === 'metricas' || currentTab === 'equipe')) {
      setCurrentTab('dashboard');
    }
  }, [isCeo, currentTab]);

  // Atualização de perfil
  const handleProfileUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('crm_session', JSON.stringify(updatedUser));
    loadInitialData();
  };

  // Se não estiver logado, exibe tela de login
  if (!currentUser) {
    return (
      <LoginView 
        onLoginSuccess={handleLoginSuccess} 
        theme={theme} 
        onToggleTheme={handleToggleTheme} 
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <div 
      data-accent={accentColor}
      className={`flex min-h-screen transition-colors ${
        isDark 
          ? 'bg-[#0c0d12] text-gray-100 selection:bg-brand selection:text-black' 
          : 'bg-[#f4f5f8] text-gray-900 selection:bg-brand selection:text-black'
      }`}
    >
      {/* Sidebar Lateral */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenSwitchProfile={() => setIsProfileModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        whatsappsCount={whatsapps.length}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          period={period}
          setPeriod={setPeriod}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          onSetCustomDates={handleSetCustomDates}
          isRefreshing={isRefreshing}
          whatsappFilter={whatsappFilter}
          setWhatsappFilter={setWhatsappFilter}
          whatsapps={whatsapps}
          onOpenSaleModal={() => setIsSaleModalOpen(true)}
          currentUser={currentUser}
          accentColor={accentColor}
          onSelectAccent={handleSelectAccent}
          onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {loading && !metrics ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <div className="w-8 h-8 border-2 border-[#f5b800] border-t-transparent rounded-full animate-spin mr-3" />
              <span>Carregando dados...</span>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  metrics={metrics}
                  currentUser={currentUser}
                  sales={sales}
                  followups={followups}
                  onOpenSaleModal={() => setIsSaleModalOpen(true)}
                  onViewAllSales={() => setCurrentTab('vendas')}
                  onViewAllFollowups={() => setCurrentTab('followups')}
                  onReload={refreshData}
                  periodLabel={getPeriodLabel()}
                />
              )}

              {/* ABA DE MÉTRICAS E LUCRO: EXCLUSIVA PARA O CEO (GUSTAVO) */}
              {currentTab === 'metricas' && isCeo && (
                <AdminMetricsView
                  metrics={metrics}
                  users={users}
                  whatsapps={whatsapps}
                  period={period}
                  setPeriod={setPeriod}
                  customStartDate={customStartDate}
                  setCustomStartDate={setCustomStartDate}
                  customEndDate={customEndDate}
                  setCustomEndDate={setCustomEndDate}
                  onSetCustomDates={handleSetCustomDates}
                  isRefreshing={isRefreshing}
                  periodLabel={getPeriodLabel()}
                  onReload={refreshData}
                />
              )}

              {currentTab === 'vendas' && (
                <SalesListView
                  sales={sales}
                  users={users}
                  whatsapps={whatsapps}
                  onOpenSaleModal={() => setIsSaleModalOpen(true)}
                  onReload={refreshData}
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'whatsapps' && (
                <WhatsappsView
                  whatsapps={whatsapps}
                  onReload={() => {
                    loadInitialData();
                    refreshData();
                  }}
                  metrics={metrics}
                />
              )}

              {currentTab === 'equipe' && isCeo && (
                <TeamView
                  users={users}
                  onReload={() => {
                    loadInitialData();
                    refreshData();
                  }}
                  metrics={metrics}
                />
              )}

              {currentTab === 'followups' && (
                <FollowupsView
                  followups={followups}
                  onReload={refreshData}
                  users={users}
                  whatsapps={whatsapps}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal de Registro de Venda */}
      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSaleCreated={refreshData}
        users={users}
        whatsapps={whatsapps}
        currentUser={currentUser}
      />

      {/* Modal de Alternar Perfil (Visível apenas para o CEO) */}
      {isCeo && (
        <ProfileSwitchModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          users={users}
          currentUser={currentUser}
          onSelectUser={(u) => {
            setCurrentUser(u);
            localStorage.setItem('crm_session', JSON.stringify(u));
          }}
        />
      )}

      {/* Modal de Editar Próprio Perfil */}
      <ProfileEditModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={handleProfileUpdated}
        currentAccent={accentColor}
        onSelectAccent={handleSelectAccent}
      />

      {/* Modal de Gastos Avulsos / IAs */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onExpenseSaved={refreshData}
        users={users}
      />
    </div>
  );
}
