@echo off
echo ==========================================
echo  Biblioteca Imaginaria Visual - Subir Nuvem
echo ==========================================
echo.
set /p msg="Mensagem da alteracao (ou aperte Enter para padrao): "
if "%msg%"=="" set msg=Atualizacao automatica via script local

echo.
echo [1/3] Preparando arquivos...
git add .

echo.
echo [2/3] Criando commit...
git commit -m "%msg%"

echo.
echo [3/3] Enviando para o GitHub...
git push origin main

echo.
echo ==========================================
echo  Alteracoes enviadas com sucesso!
echo ==========================================
pause
