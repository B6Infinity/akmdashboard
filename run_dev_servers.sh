#!/bin/bash

# Analysis Backend
source intelligence_backend/akmvenv/bin/activate
echo "Activated akmvenv"
uvicorn intelligence_backend.main:app --port 4001 --reload & # Run the intelligence backend in the background


npm start --prefix backend &     # Run the first command in the background
npm run dev --prefix admin_panel_akm &  # Run the second command in the background



wait

echo "Both servers terminated..."