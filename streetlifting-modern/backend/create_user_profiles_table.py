#!/usr/bin/env python3
"""
Migration script to create user_profiles table
"""

import sqlite3
import os
from datetime import datetime

def create_user_profiles_table():
    """Create user_profiles table in the database"""
    
    # Get the database path
    db_path = "streetlifting.db"
    
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if table already exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_profiles'
        """)
        
        if cursor.fetchone():
            print("Table user_profiles already exists!")
            return True
        
        # Create user_profiles table
        cursor.execute("""
            CREATE TABLE user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                body_weight REAL,
                height REAL,
                age INTEGER,
                gender VARCHAR(10),
                experience_level VARCHAR(20),
                training_goals TEXT,  -- JSON array
                training_frequency VARCHAR(10),
                initial_muscle_ups_rm REAL,
                initial_pull_ups_rm REAL,
                initial_dips_rm REAL,
                initial_squats_rm REAL,
                preferred_training_time VARCHAR(20),
                available_training_days TEXT,  -- JSON array
                max_session_duration INTEGER,
                has_injuries BOOLEAN DEFAULT 0,
                injury_details VARCHAR(500),
                medical_conditions VARCHAR(500),
                has_pull_up_bar BOOLEAN DEFAULT 1,
                has_dip_bars BOOLEAN DEFAULT 1,
                has_weights BOOLEAN DEFAULT 0,
                has_gym_access BOOLEAN DEFAULT 0,
                has_completed_setup BOOLEAN DEFAULT 0,
                setup_completed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
        
        # Create index on user_id for faster lookups
        cursor.execute("""
            CREATE INDEX idx_user_profiles_user_id ON user_profiles (user_id)
        """)
        
        # Commit the changes
        conn.commit()
        print("✅ Table user_profiles created successfully!")
        
        # Show table structure
        cursor.execute("PRAGMA table_info(user_profiles)")
        columns = cursor.fetchall()
        print("\n📋 Table structure:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Error creating table: {e}")
        return False
        
    finally:
        if conn:
            conn.close()

def add_sample_profiles():
    """Add sample user profiles for testing"""
    
    db_path = "streetlifting.db"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get existing users
        cursor.execute("SELECT id, username FROM users LIMIT 5")
        users = cursor.fetchall()
        
        if not users:
            print("No users found to add sample profiles!")
            return
        
        print(f"\n👥 Found {len(users)} users, adding sample profiles...")
        
        for user_id, username in users:
            # Check if profile already exists
            cursor.execute("SELECT id FROM user_profiles WHERE user_id = ?", (user_id,))
            if cursor.fetchone():
                print(f"  - Profile already exists for user {username}")
                continue
            
            # Add sample profile
            cursor.execute("""
                INSERT INTO user_profiles (
                    user_id, body_weight, height, age, gender, experience_level,
                    training_goals, training_frequency, initial_muscle_ups_rm,
                    initial_pull_ups_rm, initial_dips_rm, initial_squats_rm,
                    preferred_training_time, available_training_days, max_session_duration,
                    has_injuries, has_pull_up_bar, has_dip_bars, has_weights,
                    has_gym_access, has_completed_setup
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, 75.5, 175.0, 25, 'male', 'intermediate',
                '["strength", "muscle"]', '3-4', 0.0, 10.0, 15.0, 100.0,
                'afternoon', '["monday", "wednesday", "friday"]', 60,
                0, 1, 1, 0, 0, 1
            ))
            
            print(f"  ✅ Added sample profile for user {username}")
        
        conn.commit()
        print("\n🎉 Sample profiles added successfully!")
        
    except sqlite3.Error as e:
        print(f"❌ Error adding sample profiles: {e}")
        
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🚀 Starting user_profiles table migration...")
    
    # Create the table
    if create_user_profiles_table():
        # Add sample profiles
        add_sample_profiles()
        print("\n✅ Migration completed successfully!")
    else:
        print("\n❌ Migration failed!") 