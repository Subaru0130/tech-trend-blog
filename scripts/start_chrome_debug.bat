@echo off
echo Killing existing Chrome processes...
taskkill /F /IM chrome.exe >nul 2>&1
timeout /t 2 >nul

echo Starting Chrome in Remote Debugging Mode (Port 9222)...
echo Please keep this window open or minimized. Do not close Chrome manually while the script is running.
echo.

powershell -Command "Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList '--remote-debugging-port=9222', '--user-data-dir=%LOCALAPPDATA%\Google\Chrome\User Data', '--profile-directory=Default'"

echo Chrome started! You can now run the Node.js script.
pause
