"""
Admin user initialization module
"""
from app.core.database import SessionLocal
from app.models.user import User
from app.services.auth import get_password_hash

def create_admin_user():
    """Create admin user if it doesn't exist"""
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            # Create admin user
            admin_user = User(
                username="admin",
                email="admin@streetlifting.com",
                hashed_password=get_password_hash("admin"),
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Admin user created successfully!")
            print("   Username: admin")
            print("   Password: admin")
        else:
            print("ℹ️  Admin user already exists")
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close() 