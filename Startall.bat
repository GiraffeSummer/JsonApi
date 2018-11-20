@echo off
title Webdomain (jsonapi) host
cls & start start.bat
set /a dit = 0
goto loop


:loop
set /a dit = dit + 1
ssh -R jsonapi:443:localhost:8081 serveo.net
goto loop