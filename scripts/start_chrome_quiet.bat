@echo off
chcp 65001 >nul 2>&1
echo [Chrome Debug Launcher] Starting...
echo [INFO] Using your logged-in Chrome profile for Amazon access

echo [Step 1] Force-killing ALL Chrome processes via PowerShell...
powershell -Command "Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue"
powershell -Command "Stop-Process -Name chromedriver -Force -ErrorAction SilentlyContinue"

echo [Step 2] Waiting for processes to terminate (5 seconds)...
ping -n 6 127.0.0.1 >nul

echo [Step 3] Verifying Chrome is fully closed...
powershell -Command "if (Get-Process -Name chrome -ErrorAction SilentlyContinue) { Stop-Process -Name chrome -Force; Start-Sleep 2 }"

echo [Step 4] Starting Chrome in Remote Debugging Mode (Port 9222)...
echo          Using your Default profile (with Amazon login)...
powershell -Command "Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList '--remote-debugging-port=9222','--user-data-dir=%LOCALAPPDATA%\Google\Chrome\User Data','--profile-directory=Default','--no-first-run'"

echo [Step 5] Waiting for Chrome to initialize (10 seconds)...
ping -n 11 127.0.0.1 >nul

echo [Step 6] Testing debug port...
node -e "const http=require('http');http.get('http://127.0.0.1:9222/json/version',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>console.log('[SUCCESS] Debug port active: '+JSON.parse(d).Browser));}).on('error',e=>console.log('[WARNING] Port not ready:',e.message));" 2>nul

echo [Done] Chrome debug launcher complete.
exit /b 0
