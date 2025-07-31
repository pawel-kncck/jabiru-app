# backend/scripts/fix_file_paths.py
"""
Script to check and fix file path inconsistencies in the database.
Run this to ensure all file paths are correctly stored relative to the upload directory.
"""

from src.storage.local import LocalFileStorage
from src.models.file import File
from src.config import settings
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))


def fix_file_paths():
    """Check and fix file paths in the database"""

    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    # Create storage instance
    storage = LocalFileStorage(settings.UPLOAD_DIRECTORY)
    upload_dir = Path(settings.UPLOAD_DIRECTORY)

    try:
        # Get all files
        files = db.query(File).all()
        fixed_count = 0

        print(f"Checking {len(files)} files...")
        print(f"Upload directory: {upload_dir.absolute()}")

        for file in files:
            print(f"\nChecking file: {file.filename}")
            print(f"  Current path in DB: {file.path}")

            # Check if the current path works
            current_full_path = storage.get_full_path(file.path)
            if current_full_path.exists():
                print(f"  ✓ File exists at: {current_full_path}")
                continue

            # Try to find the file
            possible_locations = [
                # Direct path
                Path(file.path),
                # In upload directory with current path
                upload_dir / file.path,
                # Project directory structure
                upload_dir / str(file.project_id) / file.filename,
                # Just filename in upload directory
                upload_dir / file.filename,
            ]

            found = False
            for location in possible_locations:
                if location.exists():
                    # Calculate the correct relative path
                    if location.is_relative_to(upload_dir):
                        new_path = str(location.relative_to(upload_dir))
                    else:
                        # File is outside upload directory, need to move it
                        new_location = upload_dir / \
                            str(file.project_id) / file.filename
                        new_location.parent.mkdir(parents=True, exist_ok=True)
                        location.rename(new_location)
                        new_path = str(new_location.relative_to(upload_dir))

                    print(f"  → Found at: {location}")
                    print(f"  → Updating path to: {new_path}")

                    file.path = new_path
                    fixed_count += 1
                    found = True
                    break

            if not found:
                print(f"  ✗ FILE NOT FOUND anywhere!")
                print(
                    f"    Searched in: {[str(p) for p in possible_locations]}")

        if fixed_count > 0:
            db.commit()
            print(f"\n✓ Fixed {fixed_count} file paths")
        else:
            print("\n✓ All file paths are correct")

    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    fix_file_paths()
