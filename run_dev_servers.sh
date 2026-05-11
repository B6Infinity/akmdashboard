#!/bin/bash

# Analysis Backend
source intelligence_backend/akmvenv/bin/activate
echo "Activated akmvenv"
uvicorn intelligence_backend.main:app --port 4001 --reload & # Run the intelligence backend in the background

# Express Backend
npm start --prefix backend &

# Admin Panel Frontend
npm run dev --prefix admin_panel_akm &

# User Frontend
npm run dev --prefix frontend &

wait

echo "All servers terminated..."