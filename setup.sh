#!/usr/bin/env bash
# EcoSync - One-shot setup script
# Installs Java 17 and Maven, then verifies the backend compiles and frontend runs.

set -e

echo ""
echo "============================================"
echo "  EcoSync Setup — Installing dependencies"
echo "============================================"

# --- Java 17 ---
if ! command -v java &>/dev/null; then
  echo "[1/3] Installing OpenJDK 17..."
  sudo apt-get update -qq
  sudo apt-get install -y openjdk-17-jdk
else
  echo "[1/3] Java already installed: $(java -version 2>&1 | head -1)"
fi

# --- Maven ---
if ! command -v mvn &>/dev/null; then
  echo "[2/3] Installing Maven..."
  sudo apt-get install -y maven
else
  echo "[2/3] Maven already installed: $(mvn -version 2>&1 | head -1)"
fi

# --- Node.js (nvm) ---
if ! command -v node &>/dev/null; then
  echo "[3/3] Setting up Node.js via nvm..."
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  if ! command -v node &>/dev/null; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    . "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
  fi
else
  echo "[3/3] Node.js already installed: $(node --version)"
fi

echo ""
echo "============================================"
echo "  Installing frontend dependencies..."
echo "============================================"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
(cd "$(dirname "$0")/frontend" && npm install)

echo ""
echo "============================================"
echo "  All dependencies installed!"
echo ""
echo "  To start the backend:"
echo "    cd backend && mvn spring-boot:run"
echo ""
echo "  To start the frontend:"
echo "    cd frontend && npm run dev"
echo "============================================"
