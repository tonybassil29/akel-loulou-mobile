@echo off
REM ---------------------------------------------------------------------------
REM  Build iOS de production + envoi vers TestFlight.
REM
REM  A lancer depuis PowerShell ou l'invite de commandes Windows, PAS depuis WSL :
REM      cd C:\Users\tonyb\Documents\AkelLoulou-mobile
REM      scripts\build-ios.cmd
REM
REM  La toute premiere fois, EAS doit creer un certificat de distribution et un
REM  profil de provisionnement chez Apple. Cette etape ne peut pas etre
REM  automatisee : elle pose des questions. Reponds "Yes" a tout.
REM  Les fois suivantes, tout passe sans question.
REM ---------------------------------------------------------------------------

set EXPO_ASC_API_KEY_PATH=%~dp0..\.secrets\AuthKey_A476YC7FGM.p8
set EXPO_ASC_KEY_ID=A476YC7FGM
set EXPO_ASC_ISSUER_ID=e74a3f34-05de-4e28-8ccc-04b8534d6cbb
set EXPO_APPLE_TEAM_ID=G67U5SNR8X
set EAS_BUILD_NO_EXPO_GO_WARNING=true

echo.
echo === 1/2 : construction du binaire iOS chez EAS (20 a 40 min) ===
echo.
call npx eas-cli@latest build -p ios --profile production
if errorlevel 1 goto :echec

echo.
echo === 2/2 : envoi du binaire vers TestFlight ===
echo.
call npx eas-cli@latest submit -p ios --profile production --latest
if errorlevel 1 goto :echec

echo.
echo TERMINE. Le binaire arrive dans App Store Connect - TestFlight dans ~15 min.
echo Il faudra encore renseigner les "Informations de test" avant de pouvoir
echo l'installer, et rien n'est envoye en revue App Store par ce script.
goto :fin

:echec
echo.
echo ECHEC. Lis le message ci-dessus : il dit precisement ce qui manque.

:fin
pause
