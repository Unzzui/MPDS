#!/usr/bin/env python3
"""
Migration script to add strategy-specific fields to training_blocks table
"""

import sqlite3
import json
from pathlib import Path

def migrate_database():
    """Add new strategy fields to training_blocks table"""
    
    # Connect to the database
    db_path = Path("streetlifting.db")
    if not db_path.exists():
        print("❌ Database file not found!")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔄 Starting migration: Adding strategy fields...")
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(training_blocks)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # List of new columns to add
        new_columns = [
            ("description", "TEXT"),
            ("volume_multiplier", "REAL DEFAULT 1.0"),
            ("intensity_focus", "TEXT DEFAULT 'moderate'"),
            ("daily_variation", "TEXT DEFAULT 'intensity'"),
            ("intensity_range", "TEXT DEFAULT '70-90'"),
            ("volume_cycles", "INTEGER DEFAULT 3"),
            ("max_effort_days", "INTEGER DEFAULT 1"),
            ("dynamic_effort_days", "INTEGER DEFAULT 1"),
            ("repetition_effort_days", "INTEGER DEFAULT 1"),
            ("wave_pattern", "TEXT DEFAULT 'ascending'"),
            ("wave_amplitude", "INTEGER DEFAULT 10"),
            ("wave_frequency", "TEXT DEFAULT 'weekly'"),
            ("max_reps", "TEXT")  # JSON field
        ]
        
        # Add each column if it doesn't exist
        for column_name, column_type in new_columns:
            if column_name not in columns:
                print(f"  ➕ Adding column: {column_name}")
                cursor.execute(f"ALTER TABLE training_blocks ADD COLUMN {column_name} {column_type}")
            else:
                print(f"  ✅ Column already exists: {column_name}")
        
        # Update existing records with default values for JSON fields
        cursor.execute("UPDATE training_blocks SET max_reps = ? WHERE max_reps IS NULL", 
                      (json.dumps({
                          "muscle_ups": 0,
                          "pull_ups": 0,
                          "dips": 0,
                          "squats": 0
                      }),))
        
        # Commit changes
        conn.commit()
        print("✅ Migration completed successfully!")
        
        # Verify the changes
        cursor.execute("PRAGMA table_info(training_blocks)")
        final_columns = [column[1] for column in cursor.fetchall()]
        print(f"📊 Total columns in training_blocks: {len(final_columns)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        return False
    
    finally:
        conn.close()

if __name__ == "__main__":
    success = migrate_database()
    if success:
        print("\n🎉 Database migration completed successfully!")
        print("The training_blocks table now supports all strategy-specific fields.")
    else:
        print("\n💥 Migration failed. Please check the error messages above.")
        exit(1) 