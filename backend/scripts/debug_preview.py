#!/usr/bin/env python3
# backend/scripts/debug_preview.py
"""
Debug script to test file preview functionality
Run from backend directory: python scripts/debug_preview.py
"""

from src.services.data_processing import DataProcessingService
import os
import sys
from pathlib import Path
import pandas as pd
import chardet

# Add backend (parent) directory to path so we can import modules
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


def check_file_details(filepath):
    """Check file encoding, size, and basic properties"""
    path = Path(filepath)

    print(f"\n{'='*60}")
    print(f"Checking: {path.name}")
    print(f"{'='*60}")

    # File properties
    print(f"Full path: {path.absolute()}")
    print(f"Exists: {path.exists()}")
    print(f"Size: {path.stat().st_size} bytes")
    print(f"Readable: {os.access(path, os.R_OK)}")

    # Check encoding
    with open(path, 'rb') as f:
        raw_data = f.read(10000)  # Read first 10KB
        result = chardet.detect(raw_data)
        print(
            f"Detected encoding: {result['encoding']} (confidence: {result['confidence']})")

    # Try to read first few lines
    print("\nFirst 5 lines of file:")
    try:
        with open(path, 'r', encoding=result['encoding'] or 'utf-8') as f:
            for i, line in enumerate(f):
                if i >= 5:
                    break
                print(f"  {i+1}: {line.rstrip()}")
    except Exception as e:
        print(f"  Error reading file: {e}")

    # Try to parse with pandas directly
    print("\nTrying pandas read_csv directly:")
    try:
        df = pd.read_csv(path, nrows=5)
        print(f"  Success! Shape: {df.shape}")
        print(f"  Columns: {list(df.columns)}")
    except Exception as e:
        print(f"  Error: {e}")

    # Try with DataProcessingService
    print("\nTrying DataProcessingService.parse_csv_file:")
    try:
        df, metadata = DataProcessingService.parse_csv_file(path)
        print(f"  Success! Shape: {df.shape}")
        print(f"  Metadata: {metadata}")
    except Exception as e:
        print(f"  Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()


def main():
    # Check both files - paths relative to backend directory
    backend_dir = Path(__file__).parent.parent
    files = [
        backend_dir / "uploads/83035901-f61d-4dcc-af22-b9de79580a9b/pl_adaptive.csv",
        backend_dir / "uploads/83035901-f61d-4dcc-af22-b9de79580a9b/pl_budget.csv"
    ]

    for filepath in files:
        if filepath.exists():
            check_file_details(filepath)
        else:
            print(f"\nFile not found: {filepath}")
            # Try to help locate the file
            uploads_dir = backend_dir / "uploads"
            if uploads_dir.exists():
                print(f"Uploads directory exists at: {uploads_dir}")
                print("Contents:")
                for item in uploads_dir.iterdir():
                    print(f"  - {item.name}")
            else:
                print(f"Uploads directory not found at: {uploads_dir}")


if __name__ == "__main__":
    main()
