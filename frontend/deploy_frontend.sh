#!/bin/bash
# FinOS Frontend - EC2 Setup & Run Script
# Usage: ./deploy_frontend.sh <BACKEND_PUBLIC_IP>
set -e

BACKEND_IP=$1

if [ -z "$BACKEND_IP" ]; then
    echo "Error: Backend Public IP is required."
    echo "Usage: ./deploy_frontend.sh <BACKEND_PUBLIC_IP>"
    exit 1
fi

echo "=== Updating packages and installing Node.js 20 ==="
sudo apt-get update -y
sudo apt-get install -y curl
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "=== Ensuring swap memory for t2.micro safety ==="
if [ $(free -m | awk '/^Swap:/{print $2}') -eq 0 ]; then
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
fi

echo "=== Configuring Backend API URL ==="
echo "NEXT_PUBLIC_API_URL=\"http://${BACKEND_IP}:8000\"" > .env.local

echo "=== Installing dependencies ==="
npm install

echo "=== Building Next.js production bundle ==="
npm run build

echo "=== Starting Next.js on port 3000 ==="
nohup npm run start -- -p 3000 > frontend.log 2>&1 &

echo "Frontend is running in the background on port 3000."
echo "Check logs with: tail -f frontend.log"
