import localtunnel from 'localtunnel';

const PORT = process.env.PORT || 3001;
const SUBDOMAIN = process.env.TUNNEL_SUBDOMAIN || 'carica-crm-gustavo';

let currentTunnel = null;

async function startTunnel() {
  if (currentTunnel) {
    try { currentTunnel.close(); } catch (_) {}
    currentTunnel = null;
  }
  console.log(`[Localtunnel] Solicitando túnel para porta ${PORT} no subdomínio "${SUBDOMAIN}"...`);
  try {
    currentTunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });
    console.log(`[Localtunnel] Conectado! URL: ${currentTunnel.url}`);

    if (currentTunnel.url !== `https://${SUBDOMAIN}.loca.lt`) {
      console.warn(`[Localtunnel] AVISO: Recebeu URL temporária ${currentTunnel.url}. Tentando fixar https://${SUBDOMAIN}.loca.lt em 3s...`);
      setTimeout(startTunnel, 3000);
      return;
    }

    console.log(`[Localtunnel] ✅ SUCESSO: Subdomínio oficial https://${SUBDOMAIN}.loca.lt está ATIVO e pronto para a Vercel!`);

    currentTunnel.on('close', () => {
      console.log('[Localtunnel] Conexão fechada. Reconectando em 3s...');
      setTimeout(startTunnel, 3000);
    });

    currentTunnel.on('error', (err) => {
      console.error(`[Localtunnel] Erro: ${err.message}. Reconectando em 3s...`);
      setTimeout(startTunnel, 3000);
    });
  } catch (err) {
    console.error(`[Localtunnel] Falha ao iniciar: ${err.message}. Tentando novamente em 5s...`);
    setTimeout(startTunnel, 5000);
  }
}

// Mantém o processo do Node permanentemente ativo (evita que o event loop finalize)
setInterval(() => {
  // Heartbeat do túnel
}, 10000);

startTunnel();
