#!/bin/bash

# ─────────────────────────────────────────────
#  SyncFit — Start All Services (ULTRA STABLE)
# ─────────────────────────────────────────────

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BOLD}${CYAN}"
echo "  ███████╗██╗   ██╗███╗   ██╗ ██████╗███████╗██╗████████╗"
echo "  ╚════██║  ╚██╔╝  ██║╚██╗██║██║     ██╔══╝  ██║   ██║   "
echo "  ███████║   ██║   ██║ ╚████║╚██████╗██║     ██║   ██║   "
echo -e "${RESET}"
echo -e "${BOLD}  🚀 SyncFit RAM - Launcher Final${RESET}"
echo ""

# ── 0. Cleanup force ─────────────────────────────────────────────
echo -e "${BOLD}[0/3]${RESET} 🔥 Curat procese reziduale..."
fuser -k 5173/tcp 2>/dev/null
fuser -k 8080/tcp 2>/dev/null
pkill -f cloudflared 2>/dev/null
pkill -f localtunnel 2>/dev/null
sleep 2

# ── 1. Backend ────────────────────────────────────────────────────
echo -e "${BOLD}[1/3]${RESET} 🔧 Pornesc Backend..."
mvn -f backend/pom.xml spring-boot:run > /tmp/syncfit-backend.log 2>&1 &
BACKEND_PID=$!
echo -n "     Astept backend-ul"
for i in $(seq 1 60); do
  if curl -s http://localhost:8080/api/users > /dev/null 2>&1; then
    echo -e " ${GREEN}✓${RESET}"
    break
  fi
  echo -n "."
  sleep 1
done

# ── 2. Frontend ───────────────────────────────────────────────────
echo -e "${BOLD}[2/3]${RESET} 🎨 Pornesc Frontend (Vite)..."
npm --prefix frontend run dev > /tmp/syncfit-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -n "     Astept frontend-ul"
for i in $(seq 1 30); do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e " ${GREEN}✓${RESET}"
    break
  fi
  echo -n "."
  sleep 1
done

# ── 3. Cloudflare Tunnel ──────────────────────────────────────────
echo -e "${BOLD}[3/3]${RESET} 🌐 Creez Tunel Cloudflare..."
TUNNEL_LOG="/tmp/syncfit-tunnel.log"
cloudflared tunnel --url http://localhost:5173 > "$TUNNEL_LOG" 2>&1 &
TUNNEL_PID=$!

# Extrage URL-ul
echo -n "     Generez link public"
PUBLIC_URL=""
for i in $(seq 1 30); do
  PUBLIC_URL=$(grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | head -1)
  if [ -n "$PUBLIC_URL" ]; then
    break
  fi
  echo -n "."
  sleep 1
done
echo ""

# ── Final ────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}${GREEN}  ✅ SyncFit ESTE LIVE!${RESET}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  🌍 Public:   ${BOLD}${YELLOW}$PUBLIC_URL${RESET}"
echo ""
echo -e "  ⚠️  ${BOLD}${RED}NU INCHIDE ACEST TERMINAL ȘI NU DA CTRL+C!${RESET}"
echo -e "     Dacă îl oprești, link-ul moare imediat."
echo ""
echo -e "${CYAN}  Acum poți deschide link-ul de mai sus pe telefon!${RESET}"
echo ""

cleanup() {
  echo -e "\n${YELLOW}⏹  Inchidere...${RESET}"
  kill $BACKEND_PID $FRONTEND_PID $TUNNEL_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

wait
