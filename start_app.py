#!/usr/bin/env python3
"""
BuildSafe-AI Full-Stack Application Launcher
Starts both the FastAPI Backend (port 8000) and the React Vite Frontend (port 5173).
"""

import subprocess
import sys
import time
import os
import signal
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT_DIR / "frontend"
BACKEND_SCRIPT = ROOT_DIR / "backend" / "run.py"

def main():
    print("=" * 70)
    print("🚀  Starting BuildSafe-AI System (Backend + Frontend)")
    print("=" * 70)

    # 1. Start Backend
    print("\n[1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, str(BACKEND_SCRIPT)],
        cwd=str(ROOT_DIR),
    )

    # Allow backend to initialize
    time.sleep(2)

    # 2. Start Frontend
    print("[2/2] Launching React Vite Frontend on http://localhost:5173 ...")
    frontend_cmd = "npm run dev"
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=str(FRONTEND_DIR),
        shell=True,
    )

    print("\n" + "=" * 70)
    print("✨  BuildSafe-AI Services are running!")
    print("   👉 Frontend (Client Interface): http://localhost:5173")
    print("   👉 Backend API & Swagger Docs: http://127.0.0.1:8000/docs")
    print("   👉 Health Check Endpoint:     http://127.0.0.1:8000/api/health")
    print("=" * 70)
    print("Press CTRL+C to terminate both servers.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑  Shutting down BuildSafe-AI services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        try:
            backend_proc.wait(timeout=5)
            frontend_proc.wait(timeout=5)
        except Exception:
            backend_proc.kill()
            frontend_proc.kill()
        print("Done. Goodbye!")

if __name__ == "__main__":
    main()
