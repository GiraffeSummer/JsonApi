@echo off
title Json APi
set /a run = 1
cls & node index.js

goto loop

:loop

node index.js


:crash
echo.
echo ------CRASH----
echo.
set /a run = run +1
goto loop

pause >nul