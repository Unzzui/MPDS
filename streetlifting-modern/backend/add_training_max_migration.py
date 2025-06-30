#!/usr/bin/env python3
"""
Migration script to add the missing 'training_max' column to the one_rep_maxes table.
This column is required by the OneRepMax model but doesn't exist in the current database.
"""

import sqlite3
import os
from datetime import datetime

def add_training_max_column():
    """Add the training_max column to the one_rep_maxes table"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), 'streetlifting.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Database file not found at: {db_path}")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if the column already exists
        cursor.execute("PRAGMA table_info(one_rep_maxes)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'training_max' in columns:
            print("✅ Column 'training_max' already exists in one_rep_maxes table")
            conn.close()
            return True
        
        print("📋 Current columns in one_rep_maxes:", columns)
        
        # Add the training_max column
        print("🔄 Adding 'training_max' column to one_rep_maxes table...")
        cursor.execute("""
            ALTER TABLE one_rep_maxes 
            ADD COLUMN training_max REAL
        """)
        
        # Update existing records to set training_max as 90% of one_rm (common practice)
        print("🔄 Updating existing records with training_max = 0.9 * one_rm...")
        cursor.execute("""
            UPDATE one_rep_maxes 
            SET training_max = one_rm * 0.9 
            WHERE training_max IS NULL
        """)
        
        # Commit the changes
        conn.commit()
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(one_rep_maxes)")
        updated_columns = [column[1] for column in cursor.fetchall()]
        
        print("✅ Migration completed successfully!")
        print("📋 Updated columns in one_rep_maxes:", updated_columns)
        
        # Show some sample data
        cursor.execute("SELECT id, exercise, one_rm, training_max FROM one_rep_maxes LIMIT 5")
        sample_data = cursor.fetchall()
        
        if sample_data:
            print("\n📊 Sample data after migration:")
            print("ID | Exercise | 1RM | Training Max")
            print("-" * 40)
            for row in sample_data:
                print(f"{row[0]} | {row[1]} | {row[2]} | {row[3]}")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        if 'conn' in locals():
            conn.close()
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        if 'conn' in locals():
            conn.close()
        return False

def main():
    """Main migration function"""
    print("🚀 Starting migration to add training_max column...")
    print(f"📅 Migration timestamp: {datetime.now().isoformat()}")
    
    success = add_training_max_column()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("🔄 You can now restart your backend server.")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
