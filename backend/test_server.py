"""Quick test script to verify FastAPI server is working"""
import requests
import time
import subprocess
import os
import signal

def test_server():
    # Start the server
    print("Starting FastAPI server...")
    process = subprocess.Popen(
        ["uvicorn", "src.main:app", "--port", "5001"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for server to start
    time.sleep(2)
    
    try:
        # Test root endpoint
        response = requests.get("http://localhost:5001/")
        print(f"Root endpoint: {response.status_code} - {response.json()}")
        
        # Test health endpoint
        response = requests.get("http://localhost:5001/health")
        print(f"Health endpoint: {response.status_code} - {response.json()}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Stop the server
        os.kill(process.pid, signal.SIGTERM)
        print("Server stopped")

if __name__ == "__main__":
    test_server()