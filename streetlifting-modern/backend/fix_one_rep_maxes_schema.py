#!/usr/bin/env python3
"""
Comprehensive migration script to add all missing columns to the one_rep_maxes table.
This fixes the mismatch between the OneRepMax model and the actual database schema.
"""

import sqlite3
import os
from datetime import datetime

def add_missing_columns():
    """Add all missing columns to the one_rep_maxes table"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), 'streetlifting.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Database file not found at: {db_path}")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current columns
        cursor.execute("PRAGMA table_info(one_rep_maxes)")
        current_columns = [column[1] for column in cursor.fetchall()]
        
        print("📋 Current columns in one_rep_maxes:", current_columns)
        
        # Define the columns that should exist according to the model
        required_columns = {
            'estimation_method': 'TEXT',
            'confidence_level': 'TEXT DEFAULT "medium"'
        }
        
        changes_made = False
        
        # Add missing columns
        for column_name, column_definition in required_columns.items():
            if column_name not in current_columns:
                print(f"🔄 Adding missing column: {column_name}")
                try:
                    cursor.execute(f"""
                        ALTER TABLE one_rep_maxes 
                        ADD COLUMN {column_name} {column_definition}
                    """)
                    changes_made = True
                    print(f"✅ Added column: {column_name}")
                except sqlite3.Error as e:
                    print(f"❌ Error adding column {column_name}: {e}")
                    return False
            else:
                print(f"✅ Column '{column_name}' already exists")
        
        if changes_made:
            # Update existing records with default values
            print("🔄 Updating existing records with default values...")
            
            # Set default estimation_method for existing records
            cursor.execute("""
                UPDATE one_rep_maxes 
                SET estimation_method = 'estimated' 
                WHERE estimation_method IS NULL
            """)
            
            # Set default confidence_level for existing records (should already have default)
            cursor.execute("""
                UPDATE one_rep_maxes 
                SET confidence_level = 'medium' 
                WHERE confidence_level IS NULL OR confidence_level = ''
            """)
            
            # Commit the changes
            conn.commit()
            print("✅ Default values applied to existing records")
        
        # Verify final schema
        cursor.execute("PRAGMA table_info(one_rep_maxes)")
        final_columns = [column[1] for column in cursor.fetchall()]
        
        print("✅ Migration completed successfully!")
        print("📋 Final columns in one_rep_maxes:", final_columns)
        
        # Show some sample data
        cursor.execute("""
            SELECT id, exercise, one_rm, training_max, estimation_method, confidence_level 
            FROM one_rep_maxes 
            LIMIT 3
        """)
        sample_data = cursor.fetchall()
        
        if sample_data:
            print("\n📊 Sample data after migration:")
            print("ID | Exercise | 1RM | Training Max | Est. Method | Confidence")
            print("-" * 70)
            for row in sample_data:
                print(f"{row[0]} | {row[1]} | {row[2]} | {row[3]} | {row[4]} | {row[5]}")
        
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
    print("🚀 Starting comprehensive migration for one_rep_maxes table...")
    print(f"📅 Migration timestamp: {datetime.now().isoformat()}")
    
    success = add_missing_columns()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("🔄 You can now restart your backend server.")
        print("🎯 All columns should now match the OneRepMax model definition.")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
