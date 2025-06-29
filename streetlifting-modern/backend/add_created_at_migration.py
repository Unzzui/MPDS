#!/usr/bin/env python3
"""
Migration script to add created_at column to routine_exercises table
"""

import sqlite3
from datetime import datetime

def add_created_at_column():
    """Add created_at column to routine_exercises table"""
    print("🔧 Adding created_at column to routine_exercises table...")
    
    try:
        # Connect to database
        conn = sqlite3.connect('streetlifting.db')
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(routine_exercises)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'created_at' in columns:
            print("✅ created_at column already exists")
            return True
        
        # Add the column
        cursor.execute("""
            ALTER TABLE routine_exercises 
            ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        """)
        
        # Update existing records with current timestamp
        current_time = datetime.now().isoformat()
        cursor.execute("""
            UPDATE routine_exercises 
            SET created_at = ? 
            WHERE created_at IS NULL
        """, (current_time,))
        
        # Commit changes
        conn.commit()
        
        print("✅ created_at column added successfully")
        print(f"✅ Updated {cursor.rowcount} existing records")
        
        # Verify the change
        cursor.execute("PRAGMA table_info(routine_exercises)")
        columns = cursor.fetchall()
        print("📋 Current table structure:")
        for column in columns:
            print(f"   - {column[1]} ({column[2]})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
        
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    add_created_at_column() 