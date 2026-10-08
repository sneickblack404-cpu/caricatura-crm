import React, { useState } from 'react';
import { Sparkles, Lock, User, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';
import { api } from '../api';

export default function LoginView({ onLoginSuccess, theme = 'dark', onToggleTheme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Informe o usuário e a senha.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(username, password);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  // Preenche APENAS o nome de usuário (SEM preencher ou expor a senha!)
  const selectProfile = (u) => {
    setUsername(u);
    setPassword('');
    setError('');
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors relative ${
      isDark ? 'bg-[#0c0d12] text-white' : 'bg-[#f4f5f8] text-gray-900'
    }`}>
      {/* Botão de Alternar Tema no Canto Superior */}
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          className={`absolute top-5 right-5 p-2.5 rounded-xl border transition flex items-center gap-2 text-xs font-semibold ${
            isDark 
              ? 'bg-[#151720] border-[#272938] text-gray-300 hover:text-white' 
              : 'bg-white border-gray-200 text-gray-700 hover:text-black shadow-sm'
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
      )}

      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className={`p-8 rounded-3xl border shadow-2xl transition-all ${
          isDark 
            ? 'bg-[#151720] border-[#272938]' 
            : 'bg-white border-gray-200 shadow-xl'
        }`}>
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f5b800] to-[#d49900] shadow-lg shadow-yellow-500/20 mb-4">
              <Sparkles className="w-7 h-7 text-black stroke-[2.5]" />
            </div>
            <div className="flex items-center justify-center gap-1.5 text-2xl font-black tracking-tight">
              <span className="text-[#f5b800]">X1</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>CRM</span>
            </div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mt-1">
              Vendas de Caricaturas · WhatsApp
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Usuário
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Selecione abaixo ou digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition border ${
                    isDark 
                      ? 'bg-[#1b1d28] border-[#2c2f42] text-white focus:border-[#f5b800]' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-[#f5b800]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Digite sua senha pessoal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition border ${
                    isDark 
                      ? 'bg-[#1b1d28] border-[#2c2f42] text-white focus:border-[#f5b800]' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-[#f5b800]'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#f5b800] hover:bg-[#e0a700] text-black font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
            >
              <span>{loading ? 'Verificando...' : 'Entrar no CRM'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>

          {/* Seleção Rápida de Perfil (Preenche APENAS o usuário, NUNCA a senha!) */}
          <div className={`mt-8 pt-6 border-t ${isDark ? 'border-[#252837]' : 'border-gray-200'}`}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
              Selecione o seu perfil para preencher:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => selectProfile('gustavo')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                  username === 'gustavo'
                    ? 'border-[#f5b800] bg-[#f5b800]/10 ring-1 ring-[#f5b800]'
                    : isDark ? 'bg-[#181a24] hover:bg-[#202230] border-[#272938]' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <div>
                  <span className="font-bold text-[#f5b800] block text-xs">Gustavo</span>
                  <span className="text-[10px] text-gray-400">CEO</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-[#f5b800]" />
              </button>

              <button
                type="button"
                onClick={() => selectProfile('luis')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  username === 'luis'
                    ? 'border-[#f5b800] bg-[#f5b800]/10 ring-1 ring-[#f5b800]'
                    : isDark ? 'bg-[#181a24] hover:bg-[#202230] border-[#272938]' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <span className="font-bold block text-xs">Luis Henrique</span>
                <span className="text-[10px] text-gray-400">Atendente</span>
              </button>

              <button
                type="button"
                onClick={() => selectProfile('david')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  username === 'david'
                    ? 'border-[#f5b800] bg-[#f5b800]/10 ring-1 ring-[#f5b800]'
                    : isDark ? 'bg-[#181a24] hover:bg-[#202230] border-[#272938]' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <span className="font-bold block text-xs">David Marques</span>
                <span className="text-[10px] text-gray-400">Atendente</span>
              </button>

              <button
                type="button"
                onClick={() => selectProfile('guilherme')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  username === 'guilherme'
                    ? 'border-[#f5b800] bg-[#f5b800]/10 ring-1 ring-[#f5b800]'
                    : isDark ? 'bg-[#181a24] hover:bg-[#202230] border-[#272938]' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <span className="font-bold block text-xs">Guilherme</span>
                <span className="text-[10px] text-gray-400">Atendente</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-500 text-center mt-2.5">
              🔒 Digite sua senha individual no campo de senha para entrar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}