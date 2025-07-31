#!/usr/bin/env python3
# backend/simple_check.py
"""
Minimal script to check file paths - no src imports needed
Run from backend directory: python simple_check.py
"""

import urllib.parse
import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Get connection details
db_url = os.getenv(
    "DATABASE_URL", "postgresql://jabiru_user:jabiru_password@localhost:5432/jabiru")
upload_dir = os.getenv("UPLOAD_DIRECTORY", "uploads")

# Parse database URL
parsed = urllib.parse.urlparse(db_url)

# Connect to database
conn = psycopg2.connect(
    host=parsed.hostname,
    port=parsed.port,
    user=parsed.username,
    password=parsed.password,
    database=parsed.path[1:]  # Remove leading /
)

cur = conn.cursor()

# Get all files
cur.execute(
    "SELECT id, filename, path, project_id, created_at FROM files ORDER BY created_at DESC")
files = cur.fetchall()

print(f"Upload directory: {Path(upload_dir).absolute()}")
print(f"Found {len(files)} files in database:\n")

for file_id, filename, path, project_id, created_at in files:
    full_path = Path(upload_dir) / path
    exists = full_path.exists()

    print(f"{filename}")
    print(f"  Created: {created_at}")
    print(f"  Path in DB: {path}")
    print(f"  Full path: {full_path}")
    print(f"  Exists: {'YES' if exists else 'NO'}")

    if not exists:
        # Check alternative locations
        alt1 = Path(upload_dir) / str(project_id) / filename
        alt2 = Path(path)  # Maybe absolute path

        if alt1.exists():
            print(f"  → Found at: {alt1}")
        elif alt2.exists():
            print(f"  → Found at: {alt2}")
        else:
            print(f"  → NOT FOUND!")
    print()

cur.close()
conn.close()
