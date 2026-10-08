@echo off
title X1 CRM - Servidor & Tunel Ngrok
chcp 65001 > nul
cls
echo ======================================================================
echo           🚀 X1 CRM · INICIANDO SERVIDOR LOCAL & TÚNEL NGROK
echo ======================================================================
echo.
echo [1/2] Abrindo o Túnel Ngrok para conectar com a Vercel...
start "Ngrok Tunnel (X1 CRM)" cmd /k "ngrok http 3001"

echo [2/2] Iniciando o Servidor Node.js (Porta 3001)...
cd /d "%~dp0server"
echo.
echo ✅ Sistema operacional! Deixe esta janela e o Ngrok abertos enquanto usa o CRM.
echo.
node index.js
pause
