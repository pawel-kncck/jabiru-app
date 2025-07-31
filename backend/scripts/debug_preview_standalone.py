#!/usr/bin/env python3
# backend/scripts/debug_preview_standalone.py
"""
Standalone debug script - no src imports needed
Run from backend directory: python scripts/debug_preview_standalone.py
"""

import os
from pathlib import Path
import pandas as pd
import chardet
import traceback


def detect_encoding(file_path):
    """Detect file encoding"""
    with open(file_path, 'rb') as file:
        raw_data = file.read(10000)
        result = chardet.detect(raw_data)
        return result['encoding'] or 'utf-8'


def check_file_details(filepath):
    """Check file encoding, size, and basic properties"""
    path = Path(filepath)

    print(f"\n{'='*60}")
    print(f"Checking: {path.name}")
    print(f"{'='*60}")

    # File properties
    print(f"Full path: {path.absolute()}")
    print(f"Exists: {path.exists()}")
    print(
        f"Size: {path.stat().st_size:,} bytes ({path.stat().st_size / 1024 / 1024:.2f} MB)")
    print(f"Readable: {os.access(path, os.R_OK)}")

    # Check encoding
    encoding = None
    try:
        with open(path, 'rb') as f:
            raw_data = f.read(10000)  # Read first 10KB
            result = chardet.detect(raw_data)
            encoding = result['encoding']
            print(
                f"Detected encoding: {encoding} (confidence: {result['confidence']})")
    except Exception as e:
        print(f"Error detecting encoding: {e}")

    # Try to read first few lines
    print("\nFirst 5 lines of file:")
    try:
        with open(path, 'r', encoding=encoding or 'utf-8', errors='replace') as f:
            for i, line in enumerate(f):
                if i >= 5:
                    break
                # Show line with special characters visible
                line_repr = repr(line.rstrip())
                print(
                    f"  Line {i+1}: {line_repr[:100]}{'...' if len(line_repr) > 100 else ''}")
    except Exception as e:
        print(f"  Error reading file: {e}")

    # Try different pandas read methods
    print("\nTrying pandas read_csv with different parameters:")

    # Method 1: Basic read
    print("\n1. Basic pd.read_csv():")
    try:
        df = pd.read_csv(path, nrows=5)
        print(f"  ✓ Success! Shape: {df.shape}")
        print(f"  Columns: {list(df.columns)}")
    except Exception as e:
        print(f"  ✗ Error: {type(e).__name__}: {str(e)[:100]}")

    # Method 2: With encoding
    print(f"\n2. pd.read_csv() with encoding='{encoding}':")
    try:
        df = pd.read_csv(path, encoding=encoding, nrows=5)
        print(f"  ✓ Success! Shape: {df.shape}")
        print(f"  Columns: {list(df.columns)}")
    except Exception as e:
        print(f"  ✗ Error: {type(e).__name__}: {str(e)[:100]}")

    # Method 3: Try different delimiters
    for delimiter in [',', ';', '\t', '|']:
        print(f"\n3. pd.read_csv() with delimiter='{repr(delimiter)}':")
        try:
            df = pd.read_csv(path, delimiter=delimiter, nrows=5)
            if len(df.columns) > 1:  # Likely correct delimiter
                print(f"  ✓ Success! Shape: {df.shape}")
                print(
                    f"  Columns: {list(df.columns)[:5]}{'...' if len(df.columns) > 5 else ''}")
                break
        except Exception as e:
            print(f"  ✗ Error: {type(e).__name__}: {str(e)[:100]}")

    # Method 4: With error handling
    print(f"\n4. pd.read_csv() with on_bad_lines='skip':")
    try:
        df = pd.read_csv(path, encoding=encoding, on_bad_lines='skip', nrows=5)
        print(f"  ✓ Success! Shape: {df.shape}")
        print(f"  Columns: {list(df.columns)}")
    except Exception as e:
        print(f"  ✗ Error: {type(e).__name__}: {str(e)[:100]}")

    # Method 5: Low memory mode
    print(f"\n5. pd.read_csv() with low_memory=False:")
    try:
        df = pd.read_csv(path, encoding=encoding, low_memory=False, nrows=5)
        print(f"  ✓ Success! Shape: {df.shape}")
        print(f"  Columns: {list(df.columns)}")

        # Get full file info
        df_full = pd.read_csv(path, encoding=encoding, low_memory=False)
        print(f"\n  Full file info:")
        print(f"    Total rows: {len(df_full):,}")
        print(f"    Total columns: {len(df_full.columns)}")
        print(
            f"    Memory usage: {df_full.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB")

    except Exception as e:
        print(f"  ✗ Error: {type(e).__name__}: {str(e)[:100]}")
        print("\n  Full traceback:")
        traceback.print_exc()


def main():
    # Check both files - paths relative to backend directory
    backend_dir = Path(__file__).parent.parent
    files = [
        backend_dir / "uploads/83035901-f61d-4dcc-af22-b9de79580a9b/pl_adaptive.csv",
        backend_dir / "uploads/83035901-f61d-4dcc-af22-b9de79580a9b/pl_budget.csv"
    ]

    print(f"Backend directory: {backend_dir}")
    print(f"Current working directory: {Path.cwd()}")

    for filepath in files:
        if filepath.exists():
            check_file_details(filepath)
        else:
            print(f"\nFile not found: {filepath}")
            # Try to help locate the file
            uploads_dir = backend_dir / "uploads"
            if uploads_dir.exists():
                print(f"Uploads directory exists at: {uploads_dir}")
                project_dir = uploads_dir / "83035901-f61d-4dcc-af22-b9de79580a9b"
                if project_dir.exists():
                    print(f"\nProject directory contents:")
                    for item in project_dir.iterdir():
                        print(
                            f"  - {item.name} ({item.stat().st_size:,} bytes)")
            else:
                print(f"Uploads directory not found at: {uploads_dir}")


if __name__ == "__main__":
    main()
