@echo off
setlocal enabledelayedexpansion
for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    set "%%A=%%B"
)
mvn test
