#!/bin/bash

echo "Starting deployment..."

cd /home/ubuntu/app || exit

# Pull latest code
git pull origin main

# =========================
# FRONTEND
# =========================

echo "Building frontend..."

cd /home/ubuntu/app/frontend || exit

npm install

npm run build

pm2 delete frontend || true

pm2 serve dist 3000 --name frontend --spa

# =========================
# BACKEND
# =========================

echo "Starting backend..."

cd /home/ubuntu/app/backend || exit

source venv/bin/activate

pip install -r requirements.txt

pm2 delete backend || true

pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name backend

# =========================
# SAVE PM2
# =========================

pm2 save

# =========================
# RESTART NGINX
# =========================

sudo systemctl restart nginx

echo "Deployment completed!"
