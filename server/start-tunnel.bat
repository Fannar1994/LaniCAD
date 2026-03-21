@echo off
REM ===================================
REM LániCAD — Start Public Tunnel
REM ===================================
REM This exposes your local API (port 3001) as a public HTTPS URL
REM via Cloudflare Tunnel. No account needed. Free.
REM
REM Share the URL with others to access your API from anywhere.
REM When you close this window, the tunnel closes.
REM ===================================

echo.
echo  LániCAD Public Tunnel
echo  =====================
echo  Starting Cloudflare Tunnel to expose localhost:3001...
echo  The public URL will appear below.
echo  Share it with others - they can reach your API while this is running.
echo  Press Ctrl+C to stop.
echo.

cloudflared tunnel --url http://localhost:3001
