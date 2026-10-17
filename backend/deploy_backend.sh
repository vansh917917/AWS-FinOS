#!/bin/bash
# FinOS Backend - EC2 Setup & Run Script
set -e

echo "=== Updating packages and installing Python ==="
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv

echo "=== Setting up Python Virtual Environment ==="
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate

echo "=== Installing dependencies ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Starting FastAPI Backend on port 8000 ==="
# Starts uvicorn in the background with nohup, logging to backend.log
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &

echo "Backend is running in the background on port 8000."
echo "Check logs with: tail -f backend.log"
