#!/bin/bash

cd /home/ubuntu/app

# START BACKEND
cd backend
source venv/bin/activate

nohup gunicorn -w 4 -b 0.0.0.0:8000 app:app &

# START FRONTEND
cd ../frontend

pm2 serve build 3000 --spa
pm2 save