#!/usr/bin/env python3
"""
Script to create admin user for StreetLifting API
"""

import sys
import os

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.init_admin import create_admin_user
from app.core.database import SessionLocal
from app.models.user import User

def main():
    """Create admin user manually"""
    print("🏋️  StreetLifting - Creating Admin User")
    print("=" * 40)
    
    try:
        # Create admin user
        create_admin_user()
        
        # Verify the user was created
        db = SessionLocal()
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        if admin_user:
            print("\n✅ Admin user created successfully!")
            print(f"   Username: {admin_user.username}")
            print(f"   Email: {admin_user.email}")
            print(f"   Active: {admin_user.is_active}")
            print(f"   Created: {admin_user.created_at}")
            print("\n🔑 You can now login with:")
            print("   Username: admin")
            print("   Password: admin")
        else:
            print("❌ Failed to create admin user")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main() 