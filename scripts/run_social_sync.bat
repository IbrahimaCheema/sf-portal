@echo off
REM ============================================================================
REM Autonomous Instagram Social Sync Runner for SF-Portal
REM Orchestrated by IT Operations Command Center (COO Agent)
REM ============================================================================

set PROJECT_DIR=c:\Users\ibrah\Downloads\antigravity-ide\sf-portal
set PYTHON_EXE=C:\Users\ibrah\AppData\Local\Programs\Python\Python314\python.exe
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

cd /d "%PROJECT_DIR%"
"%PYTHON_EXE%" scripts\sync_social_posts.py >> logs\runner_stdout.log 2>&1
