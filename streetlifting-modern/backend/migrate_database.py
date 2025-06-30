#!/usr/bin/env python3
"""
Database migration script to add routine_id column to workouts table
"""

import sqlite3
import os
from pathlib import Path

def migrate_database():
    """Add routine_id column to workouts table if it doesn't exist"""
    
    # Get the database path
    db_path = Path("streetlifting.db")
    
    if not db_path.exists():
        print("Database file not found. Creating new database...")
        return
    
    print(f"Migrating database: {db_path}")
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if routine_id column exists in workouts table
        cursor.execute("PRAGMA table_info(workouts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'routine_id' not in columns:
            print("Adding routine_id column to workouts table...")
            
            # Add the routine_id column
            cursor.execute("""
                ALTER TABLE workouts 
                ADD COLUMN routine_id INTEGER 
                REFERENCES routines(id)
            """)
            
            conn.commit()
            print("✅ Successfully added routine_id column to workouts table")
        else:
            print("✅ routine_id column already exists in workouts table")
        
        # Check if routines table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='routines'")
        if not cursor.fetchone():
            print("Creating routines table...")
            
            # Create routines table
            cursor.execute("""
                CREATE TABLE routines (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    exercises JSON NOT NULL,
                    days JSON NOT NULL,
                    main_lifts JSON NOT NULL,
                    is_active BOOLEAN NOT NULL DEFAULT 1,
                    is_template BOOLEAN NOT NULL DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Create routine_exercises table
            cursor.execute("""
                CREATE TABLE routine_exercises (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    routine_id INTEGER NOT NULL,
                    exercise_name VARCHAR(255) NOT NULL,
                    "order" INTEGER NOT NULL DEFAULT 0,
                    sets INTEGER NOT NULL DEFAULT 3,
                    reps VARCHAR(50) NOT NULL DEFAULT '8-12',
                    weight_percentage INTEGER,
                    rest_time INTEGER,
                    is_main_lift BOOLEAN NOT NULL DEFAULT 0,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (routine_id) REFERENCES routines (id)
                )
            """)
            
            conn.commit()
            print("✅ Successfully created routines and routine_exercises tables")
        else:
            print("✅ Routines table already exists")
        
        # Verify the migration
        cursor.execute("PRAGMA table_info(workouts)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Workouts table columns: {columns}")
        
        cursor.execute("PRAGMA table_info(routines)")
        routine_columns = [column[1] for column in cursor.fetchall()]
        print(f"Routines table columns: {routine_columns}")
        
        # Check if block_stages table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='block_stages'")
        if not cursor.fetchone():
            print("❌ block_stages table not found. Please run the app first to create all tables.")
            return
        
        # Check if volume_multiplier column exists
        cursor.execute("PRAGMA table_info(block_stages)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'volume_multiplier' not in columns:
            print("➕ Adding volume_multiplier column to block_stages...")
            cursor.execute("ALTER TABLE block_stages ADD COLUMN volume_multiplier FLOAT DEFAULT 1.0")
            print("✅ volume_multiplier column added")
        
        if 'intensity_focus' not in columns:
            print("➕ Adding intensity_focus column to block_stages...")
            cursor.execute("ALTER TABLE block_stages ADD COLUMN intensity_focus VARCHAR(50)")
            print("✅ intensity_focus column added")
        
        # Check if training_maxes column exists in training_blocks
        cursor.execute("PRAGMA table_info(training_blocks)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'training_maxes' not in columns:
            print("➕ Adding training_maxes column to training_blocks...")
            cursor.execute("ALTER TABLE training_blocks ADD COLUMN training_maxes JSON")
            print("✅ training_maxes column added")
        
        conn.commit()
        print("✅ Database migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        if conn:
            conn.close()
        raise

if __name__ == "__main__":
    migrate_database() 