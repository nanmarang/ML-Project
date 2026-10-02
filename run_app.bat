@echo off
echo Starting CrediXAI Underwriting Intelligence Server...
start http://127.0.0.1:5000
python backend/app.py
pause
