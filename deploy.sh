#!/bin/bash

cd /home/ubuntu/app

# FRONTEND
cd frontend
npm install
npm run build

pm2 delete frontend || true
pm2 serve build 3000 --spa --name frontend

# BACKEND
cd ../backend

python3 -m venv venv || true

source venv/bin/activate

pip install -r requirements.txt

pkill -f gunicorn || true

nohup gunicorn -w 4 -b 0.0.0.0:8000 app:app > gunicorn.log 2>&1 &