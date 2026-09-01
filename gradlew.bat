@echo off
setlocal
set "APP_HOME=%~dp0"
set "WRAPPER_DIR=%APP_HOME%gradle\wrapper"
set "WRAPPER_JAR=%WRAPPER_DIR%\gradle-wrapper.jar"
set "WRAPPER_URL=https://services.gradle.org/distributions/gradle-8.7-wrapper.jar"
set "WRAPPER_SHA=cb0da6751c2b753a16ac168bb354870ebb1e162e9083f116729cec9c781156b8"

if not exist "%WRAPPER_JAR%" goto bootstrap
for /f "tokens=*" %%H in ('powershell -NoProfile -Command "(Get-FileHash -Algorithm SHA256 '%WRAPPER_JAR%').Hash.ToLower()"') do set "ACTUAL=%%H"
if /I "%ACTUAL%"=="%WRAPPER_SHA%" goto run

echo Existing Gradle wrapper is not verified; replacing it.
del /q "%WRAPPER_JAR%"

:bootstrap
if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"
echo Bootstrapping official Gradle 8.7 wrapper...
powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -UseBasicParsing '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%.tmp'; $h=(Get-FileHash -Algorithm SHA256 '%WRAPPER_JAR%.tmp').Hash.ToLower(); if ($h -ne '%WRAPPER_SHA%') { Remove-Item '%WRAPPER_JAR%.tmp' -Force; exit 2 }; Move-Item '%WRAPPER_JAR%.tmp' '%WRAPPER_JAR%' -Force"
if errorlevel 1 exit /b %errorlevel%

:run
java -Xmx64m -Xms64m -classpath "%WRAPPER_JAR%" org.gradle.wrapper.GradleWrapperMain %*
