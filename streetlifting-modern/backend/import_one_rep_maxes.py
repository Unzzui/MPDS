#!/usr/bin/env python3
"""
Import OneRepMax data from original app's data_rm.json
"""

import json
import sqlite3
from datetime import datetime, date
from typing import Dict, Any, List

def load_data_rm():
    """Load data from data_rm.json"""
    try:
        with open('/Users/diegobravo/Documents/StreetLifting-APP/streetlifting-app/static/utils/data_rm.json', 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print("❌ data_rm.json not found")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {e}")
        return None

def get_admin_user_id(cursor):
    """Get admin user ID"""
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    result = cursor.fetchone()
    if result:
        return result[0]
    else:
        print("❌ Admin user not found")
        return None

def import_one_rep_maxes():
    """Import OneRepMax data"""
    print("🏋️ Importing OneRepMax data...")
    print("=" * 50)
    
    # Load data
    data = load_data_rm()
    if not data:
        return False
    
    print(f"📊 Loaded data with {len(data.get('rm_records', []))} records")
    
    # Connect to database
    conn = sqlite3.connect('streetlifting.db')
    cursor = conn.cursor()
    
    try:
        # Get admin user ID
        admin_id = get_admin_user_id(cursor)
        if not admin_id:
            return False
        
        print(f"👤 Using admin user ID: {admin_id}")
        
        # Clear existing OneRepMax records for admin user
        cursor.execute("DELETE FROM one_rep_maxes WHERE user_id = ?", (admin_id,))
        print(f"🗑️ Cleared {cursor.rowcount} existing OneRepMax records")
        
        # Import initial data
        initial_data = data.get('initial_data', {})
        if initial_data:
            print("\n📈 Importing initial data...")
            exercises = [
                ('pull_up_rm', 'Pull Up'),
                ('dip_rm', 'Dip'),
                ('squat_rm', 'Squat'),
                ('muscle_up_rm', 'Muscle Up')
            ]
            
            for field, exercise_name in exercises:
                if field in initial_data and initial_data[field]:
                    try:
                        date_achieved = datetime.strptime(initial_data['date'], '%Y-%m-%d').date()
                        cursor.execute("""
                            INSERT INTO one_rep_maxes (user_id, exercise, one_rm, date_achieved, created_at)
                            VALUES (?, ?, ?, ?, ?)
                        """, (admin_id, exercise_name, initial_data[field], date_achieved, datetime.now()))
                        print(f"   ✅ {exercise_name}: {initial_data[field]}kg")
                    except Exception as e:
                        print(f"   ❌ Error importing {exercise_name}: {e}")
        
        # Import historical records
        rm_records = data.get('rm_records', [])
        if rm_records:
            print(f"\n📊 Importing {len(rm_records)} historical records...")
            
            for i, record in enumerate(rm_records, 1):
                try:
                    record_date = datetime.strptime(record['date'], '%Y-%m-%d').date()
                    
                    for field, exercise_name in exercises:
                        if field in record and record[field]:
                            cursor.execute("""
                                INSERT INTO one_rep_maxes (user_id, exercise, one_rm, date_achieved, created_at)
                                VALUES (?, ?, ?, ?, ?)
                            """, (admin_id, exercise_name, record[field], record_date, datetime.now()))
                    
                    print(f"   ✅ Record {i}: {record['date']}")
                    
                except Exception as e:
                    print(f"   ❌ Error importing record {i}: {e}")
        
        # Commit changes
        conn.commit()
        
        # Verify import
        cursor.execute("SELECT COUNT(*) FROM one_rep_maxes WHERE user_id = ?", (admin_id,))
        count = cursor.fetchone()[0]
        print(f"\n✅ Successfully imported {count} OneRepMax records")
        
        # Show summary
        cursor.execute("""
            SELECT exercise, MAX(one_rm) as max_rm, COUNT(*) as record_count
            FROM one_rep_maxes 
            WHERE user_id = ? 
            GROUP BY exercise
        """, (admin_id,))
        
        print("\n📋 Summary:")
        for exercise, max_rm, record_count in cursor.fetchall():
            print(f"   {exercise}: {max_rm}kg ({record_count} records)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

def main():
    """Main function"""
    print("🚀 OneRepMax Import Script")
    print("=" * 50)
    
    success = import_one_rep_maxes()
    
    if success:
        print("\n✅ Import completed successfully!")
    else:
        print("\n❌ Import failed!")

if __name__ == "__main__":
    main() 