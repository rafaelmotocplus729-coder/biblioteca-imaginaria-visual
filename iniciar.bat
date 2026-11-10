@echo off
setlocal
cd /d "%~dp0"
title Biblioteca Imaginaria Visual - Iniciar

echo ===================================================
echo   Biblioteca Imaginaria Visual - Inicializacao
echo ===================================================
echo.

echo [1/3] Sincronizando com a nuvem (git pull)...
git pull origin main
echo.

echo [2/3] Verificando dependencias...
if not exist "node_modules" (
    echo [i] Instalando dependencias completas...
    call npm install
) else if not exist "node_modules\@supabase\supabase-js" (
    echo [!] Dependencia @supabase/supabase-js ausente. Instalando pacotes...
    call npm install
    if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
) else (
    echo [OK] Dependencias verificadas com sucesso.
)
echo.

echo [3/3] Iniciando servidor Vite...
echo O navegador abrira automaticamente quando o servidor estiver pronto.
echo (Caso queira encerrar o servidor, aperte Ctrl + C)
echo.
call npm run dev -- --open
pause

