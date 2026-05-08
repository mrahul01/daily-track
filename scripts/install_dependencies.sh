#!/bin/bash

cd /home/ubuntu/app

# FRONTEND
cd frontend
npm install
npm run build

# BACKEND
cd ../backend

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt