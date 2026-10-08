import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Sparkles, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { formatCurrency, api } from '../api';

const FacebookIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function FacebookAdsModal({ isOpen, onClose, onUpdated }) {
  const [mode, setMode] = useState('manual'); // 'manual' ou 'api'
  const [dailySpend, setDailySpend] = useState('60.00');
  const [todaySpend, setTodaySpend] = useState('0.80');
  const [accountId, setAccountId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [lastSpend, setLastSpend] = useState(null);
  const [lastError, setLastError] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncingDirect, setSyncingDirect] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    api.getFacebookConfig()
      .then(data => {
        setConnected(data.connected || false);
        setAccountId(data.accountId || '2247424592846418');
        setDailySpend(String(data.dailySpendManual || 60));
        setTodaySpend(data.todaySpend !== undefined ? String(data.todaySpend) : '0.80');
        setMode(data.mode || 'manual');
        setHasToken(Boolean(data.hasToken));
        setLastError(data.lastError || '');
        if (data.lastSpend !== undefined && data.lastSpend !== null) {
          setLastSpend(data.lastSpend);
        }
      })
      .catch(console.error);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDirectSync = async () => {
    setSyncingDirect(true);
    setStatusMsg('');
    setErrorMsg('');
    try {
      const data = await api.syncFacebookSpend();
      setLastSpend(data.spend);
      setTodaySpend(String(data.spend));
      setConnected(true);
      setStatusMsg(`Sincronizado com a Meta API! Gasto apurado hoje: ${formatCurrency(data.spend)} (${data.impressions || 0} impressões)`);
      if (onUpdated) onUpdated();
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao sincronizar com a Meta API');
    } finally {
      setSyncingDirect(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');
    setErrorMsg('');

    try {
      const data = await api.updateFacebookConfig({
        mode,
        dailySpendManual: parseFloat(dailySpend) || 0,
        todaySpend: parseFloat(todaySpend) || 0,
        accountId,
        accessToken
      });

      if (data.error) {
        throw new Error(data.error);
      }

      setStatusMsg('Configuração do Facebook Ads salva com sucesso!');
      if (data.liveSpendToday !== undefined) {
        setLastSpend(data.liveSpendToday);
      }
      setTimeout(() => {
        if (onUpdated) onUpdated();
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#151720] border border-[#272938] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252837] flex items-center justify-between bg-[#191c27]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FacebookIcon className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Configuração Facebook & Meta Ads</h3>
              <p className="text-xs text-gray-400">Acompanhe seu gasto diário e apure o lucro líquido real</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
          {statusMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {lastError && !errorMsg && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Aviso da API Meta (Token)</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                {lastError.includes('Session has expired') || lastError.includes('Error validating access token')
                  ? 'Seu token da Meta expirou. O CRM está usando os valores manuais informados abaixo para manter seu lucro 100% fiel e exato.'
                  : lastError}
              </p>
            </div>
          )}

          {/* Gasto de Hoje no Meta Ads */}
          <div className="p-4 bg-[#1b1e2c] border border-blue-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Gasto Real de Hoje no Meta Ads (R$) *</span>
              </label>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                Hoje
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 0.80"
                value={todaySpend}
                onChange={(e) => setTodaySpend(e.target.value)}
                required
                className="w-full bg-[#13141d] border border-[#2c2f42] rounded-xl pl-11 pr-4 py-2.5 text-2xl font-black text-white focus:outline-none focus:border-brand"
              />
            </div>
            
            {/* Atalhos Rápidos de Hoje */}
            <div className="flex gap-1.5 flex-wrap">
              {['0.00', '0.80', '10.00', '25.00', '50.00', '60.00'].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setTodaySpend(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                    todaySpend === val 
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/50' 
                      : 'bg-[#151720] hover:bg-[#20222e] text-gray-300 border-[#252837]'
                  }`}
                >
                  R$ {Number(val).toFixed(2).replace('.', ',')}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400">
              💡 Esse é o valor exato abatido no cálculo de <strong>Hoje</strong> do seu painel e do seu faturamento líquido.
            </p>
          </div>

          {/* Seletor de Modo */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#181a24] rounded-xl border border-[#272938]">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'manual'
                  ? 'bg-brand shadow-sm text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Gasto Diário Fixo</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('api')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'api'
                  ? 'bg-brand shadow-sm text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FacebookIcon className="w-3.5 h-3.5 fill-current" />
              <span>Conectar API Meta</span>
            </button>
          </div>

          {/* Modo 1: Gasto Diário Manual / Fixo */}
          {mode === 'manual' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Orçamento / Média Diária Padrão (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">R$</span>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    placeholder="Ex: 60,00"
                    value={dailySpend}
                    onChange={(e) => setDailySpend(e.target.value)}
                    required
                    className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl pl-10 pr-4 py-2.5 text-base font-bold text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Atalhos Rápidos */}
              <div className="flex gap-2 flex-wrap">
                {[30, 50, 60, 80, 100, 150].map(val => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setDailySpend(String(val))}
                    className="px-2.5 py-1.5 bg-[#1e202d] hover:bg-[#282a3c] rounded-lg text-xs font-semibold text-gray-300 transition"
                  >
                    R$ {val}/dia
                  </button>
                ))}
              </div>

              <div className="p-3 bg-[#181a24] rounded-xl border border-[#252837] text-xs text-gray-400 space-y-1">
                <span className="font-bold text-gray-200 block">💡 Como funciona:</span>
                <p>Usado para dias em que você não registrar o valor específico ou para estimativas mensais.</p>
              </div>
            </div>
          )}

          {/* Modo 2: API do Facebook Graph */}
          {mode === 'api' && (
            <div className="space-y-4">
              {hasToken && (
                <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <div>
                      <span className="text-xs font-bold text-emerald-400 block">Conexão Meta Ads</span>
                      <span className="text-[11px] text-gray-300">
                        Último gasto apurado: <strong className="text-white font-mono">{lastSpend !== null ? formatCurrency(lastSpend) : 'R$ 0,80'}</strong>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDirectSync}
                    disabled={syncingDirect}
                    className="px-3 py-1.5 bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border border-emerald-500/30 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncingDirect ? 'animate-spin' : ''}`} />
                    <span>{syncingDirect ? 'Buscando...' : 'Sincronizar'}</span>
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  ID da Conta de Anúncios (Ad Account ID)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 2247424592846418 ou act_2247424592846418"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand font-mono"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Conta salva: <strong>{accountId || '2247424592846418'}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Token de Acesso da Meta (Graph API Token)
                </label>
                <input
                  type="password"
                  placeholder={hasToken ? "●●●●●●●● (Token salvo - deixe em branco para manter o atual)" : "EAAB..."}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full bg-[#1b1d28] border border-[#2c2f42] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand font-mono"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  {hasToken 
                    ? "Cole um novo token do Graph API Explorer com permissão ads_read se desejar atualizar." 
                    : "Token gerado em developers.facebook.com com permissão ads_read."}
                </span>
              </div>

              <div className="p-3 bg-[#181a24] rounded-xl border border-[#252837] text-xs text-gray-400">
                <span>⚡ O CRM consulta a API do Facebook Insights em tempo real puxando o valor exato gasto em tráfego para descontar do faturamento bruto e exibir seu lucro líquido real.</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand font-black text-sm py-3.5 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-black"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Salvando & Sincronizando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Salvar Configuração de Tráfego</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
