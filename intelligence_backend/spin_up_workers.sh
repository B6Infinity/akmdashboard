# This script must be run from the root folder

echo "[INFO] Starting Workers..."
touch intelligence_backend/workers/run.flag
python intelligence_backend/workers/clustering.py