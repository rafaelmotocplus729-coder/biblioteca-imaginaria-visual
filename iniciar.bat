@echo off
echo ==========================================
echo  Biblioteca Imaginaria Visual - Iniciar
echo ==========================================
echo.
echo [1/3] Sincronizando com a nuvem (git pull)...
git pull origin main
echo.
echo [2/3] Verificando dependencias...
if not exist node_modules (
    echo Instalando pacotes...
    call npm install
)
echo.
echo [3/3] Iniciando servidor local...
echo Abrindo navegador em http://localhost:5173
start http://localhost:5173
call npm run dev
pause
