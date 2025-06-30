#!/usr/bin/env python3
"""
Migration script to add missing columns to user_profiles table
"""
import sqlite3
import os
from datetime import datetime

def migrate_user_profiles():
    """Add missing columns to user_profiles table"""
    
    # Connect to the database
    db_path = "streetlifting.db"
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get current table schema
        cursor.execute("PRAGMA table_info(user_profiles)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print("Current columns:", columns)
        
        # Define new columns to add
        new_columns = [
            ("body_weight", "REAL"),
            ("height", "REAL"),
            ("age", "INTEGER"),
            ("gender", "VARCHAR(10)"),
            ("training_goals", "TEXT"),
            ("training_frequency", "VARCHAR(10)"),
            ("initial_muscle_ups_rm", "REAL"),
            ("initial_pull_ups_rm", "REAL"),
            ("initial_dips_rm", "REAL"),
            ("initial_squats_rm", "REAL"),
            ("preferred_training_time", "VARCHAR(20)"),
            ("available_training_days", "TEXT"),
            ("max_session_duration", "INTEGER"),
            ("has_injuries", "BOOLEAN"),
            ("injury_details", "VARCHAR(500)"),
            ("medical_conditions", "VARCHAR(500)"),
            ("has_pull_up_bar", "BOOLEAN"),
            ("has_dip_bars", "BOOLEAN"),
            ("has_weights", "BOOLEAN"),
            ("has_gym_access", "BOOLEAN"),
            ("has_completed_setup", "BOOLEAN"),
            ("setup_completed_at", "DATETIME")
        ]
        
        # Add each missing column
        for column_name, column_type in new_columns:
            if column_name not in columns:
                print(f"Adding column: {column_name} {column_type}")
                cursor.execute(f"ALTER TABLE user_profiles ADD COLUMN {column_name} {column_type}")
            else:
                print(f"Column {column_name} already exists")
        
        # Set default values for boolean columns
        boolean_defaults = [
            "has_injuries",
            "has_pull_up_bar", 
            "has_dip_bars",
            "has_weights",
            "has_gym_access",
            "has_completed_setup"
        ]
        
        for column in boolean_defaults:
            if column in columns:
                # Update existing rows to have default values
                cursor.execute(f"UPDATE user_profiles SET {column} = 0 WHERE {column} IS NULL")
        
        # Commit changes
        conn.commit()
        print("Migration completed successfully!")
        
        # Show final schema
        cursor.execute("PRAGMA table_info(user_profiles)")
        final_columns = cursor.fetchall()
        print("\nFinal table schema:")
        for column in final_columns:
            print(f"  {column[1]} {column[2]}")
            
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_user_profiles() 