@echo off
rem Publishes what the admin saved: config, photos and favicon only.
chcp 65001 >nul
cd /d "%~dp0"

echo Mise en ligne du site...
echo.

git add site-config.js images Favicon
git diff --cached --quiet
if not errorlevel 1 (
  echo Rien de nouveau a mettre en ligne.
  echo Pense a cliquer sur Enregistrer dans l'admin.
  goto end
)

git commit -q -m "mise a jour depuis l'admin"
if errorlevel 1 goto failed

git pull --rebase --autostash -q
if errorlevel 1 goto failed

git push -q
if errorlevel 1 goto failed

echo C'est envoye. Le site se met a jour d'ici quelques minutes.
goto end

:failed
echo.
echo La mise en ligne a echoue. Copie le message ci-dessus pour le faire corriger.

:end
echo.
pause
