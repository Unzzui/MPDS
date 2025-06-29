#!/usr/bin/env python3
"""
Script to fix routine_exercises table by adding missing columns
"""

import sqlite3
from pathlib import Path

def fix_routine_exercises_table():
    """Add missing columns to routine_exercises table"""
    
    db_path = Path("streetlifting.db")
    if not db_path.exists():
        print("❌ Database file not found.")
        return
    
    print(f"🔧 Fixing routine_exercises table in: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check current columns in routine_exercises table
        cursor.execute("PRAGMA table_info(routine_exercises)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Current columns: {columns}")
        
        # Add created_at column if it doesn't exist
        if 'created_at' not in columns:
            print("➕ Adding created_at column to routine_exercises table...")
            cursor.execute("""
                ALTER TABLE routine_exercises 
                ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            """)
            print("✅ Added created_at column")
        else:
            print("✅ created_at column already exists")
        
        # Verify the fix
        cursor.execute("PRAGMA table_info(routine_exercises)")
        updated_columns = [column[1] for column in cursor.fetchall()]
        print(f"Updated columns: {updated_columns}")
        
        conn.commit()
        print("✅ Routine exercises table fixed successfully!")
        
    except Exception as e:
        print(f"❌ Error fixing table: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    fix_routine_exercises_table() 