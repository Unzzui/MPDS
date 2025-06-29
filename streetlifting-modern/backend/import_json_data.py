#!/usr/bin/env python3
"""
Script to import routine data from the original JSON files
"""

import json
import sqlite3
from pathlib import Path
from datetime import datetime

def import_routines_from_json():
    """Import routines from the original JSON files"""
    
    # Paths to JSON files
    routines_json_path = Path("/Users/diegobravo/Documents/StreetLifting-APP/streetlifting-app/static/utils/routines.json")
    exercises_json_path = Path("/Users/diegobravo/Documents/StreetLifting-APP/streetlifting-app/static/utils/exercises.json")
    
    if not routines_json_path.exists():
        print(f"❌ Routines JSON file not found: {routines_json_path}")
        return
    
    if not exercises_json_path.exists():
        print(f"❌ Exercises JSON file not found: {exercises_json_path}")
        return
    
    print("📁 Loading JSON data...")
    
    # Load routines data
    with open(routines_json_path, 'r', encoding='utf-8') as f:
        routines_data = json.load(f)
    
    # Load exercises data
    with open(exercises_json_path, 'r', encoding='utf-8') as f:
        exercises_data = json.load(f)
    
    print(f"✅ Loaded {len(routines_data['routines'])} routines from JSON")
    print(f"✅ Loaded {len(exercises_data)} exercises from JSON")
    
    # Connect to database
    db_path = Path("streetlifting.db")
    if not db_path.exists():
        print("❌ Database file not found. Please run the migration first.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get admin user ID (assuming admin user exists)
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        admin_user = cursor.fetchone()
        
        if not admin_user:
            print("❌ Admin user not found. Please create admin user first.")
            return
        
        admin_user_id = admin_user[0]
        print(f"👤 Using admin user ID: {admin_user_id}")
        
        # Clear existing routines (optional - comment out if you want to keep existing)
        cursor.execute("DELETE FROM routine_exercises")
        cursor.execute("DELETE FROM routines")
        print("🗑️  Cleared existing routines")
        
        # Import routines
        for i, routine_data in enumerate(routines_data['routines']):
            print(f"📝 Importing routine: {routine_data['name']}")
            
            # Clean routine name (remove emojis)
            clean_name = routine_data['name'].split(' ')[0] + ' ' + routine_data['name'].split(' ')[1]
            
            # Insert routine
            cursor.execute("""
                INSERT INTO routines (
                    user_id, name, description, exercises, days, main_lifts,
                    is_active, is_template, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                admin_user_id,
                clean_name,
                f"Imported from original app - {routine_data['name']}",
                json.dumps(routine_data['exercises']),
                json.dumps(routine_data['days']),
                json.dumps(routine_data['main_lifts']),
                False,  # Not active by default
                True,   # Mark as template
                datetime.utcnow().isoformat()
            ))
            
            routine_id = cursor.lastrowid
            
            # Insert routine exercises
            for j, exercise_name in enumerate(routine_data['exercises']):
                is_main_lift = exercise_name in routine_data['main_lifts']
                
                # Determine sets and reps based on exercise type
                if is_main_lift:
                    sets = 4
                    reps = "5-8"
                    weight_percentage = 80
                    rest_time = 180  # 3 minutes
                else:
                    sets = 3
                    reps = "8-12"
                    weight_percentage = None
                    rest_time = 90   # 1.5 minutes
                
                cursor.execute("""
                    INSERT INTO routine_exercises (
                        routine_id, exercise_name, "order", sets, reps,
                        weight_percentage, rest_time, is_main_lift, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    routine_id,
                    exercise_name,
                    j + 1,
                    sets,
                    reps,
                    weight_percentage,
                    rest_time,
                    is_main_lift,
                    datetime.utcnow().isoformat()
                ))
            
            print(f"   ✅ Added {len(routine_data['exercises'])} exercises")
        
        # Create some user-specific routines from templates
        print("🔄 Creating user routines from templates...")
        
        # Get all template routines
        cursor.execute("SELECT id, name, description, exercises, days, main_lifts FROM routines WHERE is_template = 1")
        templates = cursor.fetchall()
        
        for template_id, template_name, template_desc, exercises_json, days_json, main_lifts_json in templates:
            # Create a user routine based on this template
            user_routine_name = f"My {template_name}"
            
            cursor.execute("""
                INSERT INTO routines (
                    user_id, name, description, exercises, days, main_lifts,
                    is_active, is_template, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                admin_user_id,
                user_routine_name,
                f"Personal routine based on {template_name}",
                exercises_json,
                days_json,
                main_lifts_json,
                False,  # Not active by default
                False,  # Not a template
                datetime.utcnow().isoformat()
            ))
            
            user_routine_id = cursor.lastrowid
            
            # Copy exercises from template
            cursor.execute("""
                INSERT INTO routine_exercises (
                    routine_id, exercise_name, "order", sets, reps,
                    weight_percentage, rest_time, is_main_lift, created_at
                )
                SELECT ?, exercise_name, "order", sets, reps,
                       weight_percentage, rest_time, is_main_lift, ?
                FROM routine_exercises
                WHERE routine_id = ?
            """, (user_routine_id, datetime.utcnow().isoformat(), template_id))
            
            print(f"   ✅ Created user routine: {user_routine_name}")
        
        # Activate the first user routine
        cursor.execute("""
            UPDATE routines 
            SET is_active = 1 
            WHERE user_id = ? AND is_template = 0 
            ORDER BY id 
            LIMIT 1
        """, (admin_user_id,))
        
        conn.commit()
        
        # Verify import
        cursor.execute("SELECT COUNT(*) FROM routines WHERE is_template = 1")
        template_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM routines WHERE is_template = 0")
        user_routine_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM routine_exercises")
        exercise_count = cursor.fetchone()[0]
        
        print("\n📊 Import Summary:")
        print(f"   📋 Template routines: {template_count}")
        print(f"   👤 User routines: {user_routine_count}")
        print(f"   💪 Total exercises: {exercise_count}")
        
        # Show imported routines
        print("\n📋 Imported Routines:")
        cursor.execute("""
            SELECT name, is_template, is_active, 
                   (SELECT COUNT(*) FROM routine_exercises WHERE routine_id = routines.id) as exercise_count
            FROM routines 
            ORDER BY is_template DESC, name
        """)
        
        for name, is_template, is_active, exercise_count in cursor.fetchall():
            template_status = "📋 Template" if is_template else "👤 User"
            active_status = "✅ Active" if is_active else "⏸️  Inactive"
            print(f"   {template_status} | {name} | {exercise_count} exercises | {active_status}")
        
        print("\n✅ Data import completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during import: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    import_routines_from_json() 