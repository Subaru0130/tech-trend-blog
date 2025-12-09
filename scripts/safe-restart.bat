@echo off
echo Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo Cleaning Next.js cache...
rmdir /s /q .next >nul 2>&1

echo Starting Development Server...
echo Please wait for the server to be ready.
cmd /c "npm run dev"
