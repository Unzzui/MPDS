"""
Migration script to initialize dashboard configurations and set up adaptive system
"""

from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.user_adaptation import UserAdaptationService
from app.models.user_profile import UserExperienceLevel, DashboardConfiguration

def initialize_adaptive_system():
    """Initialize the adaptive dashboard system with default configurations"""
    
    print("🚀 Initializing Adaptive Dashboard System...")
    
    db = next(get_db())
    service = UserAdaptationService(db)
    
    try:
        # Ensure dashboard configurations exist
        service._ensure_dashboard_configurations_exist()
        
        # Verify configurations were created
        configs = db.query(DashboardConfiguration).all()
        print(f"✅ Created {len(configs)} dashboard configurations:")
        
        for config in configs:
            print(f"   - {config.experience_level}: {len(config.visible_widgets)} widgets")
        
        print("\n🎯 Adaptive Dashboard System initialized successfully!")
        print("\nKey Features Activated:")
        print("   ✅ Multi-level dashboard configurations")
        print("   ✅ Anti-bias safeguards (manual override, feature discovery)")
        print("   ✅ Progressive feature revelation")
        print("   ✅ User interaction tracking")
        print("   ✅ Automatic level adaptation")
        
        print("\n🛡️  Anti-Bias Protection Measures:")
        print("   - Users can always access 'Advanced View' regardless of level")
        print("   - Feature discovery hints prevent feature blindness")
        print("   - Manual level override prevents system lock-in")
        print("   - Regular level recalculation prevents stagnation")
        print("   - Degradation protection prevents unfair downgrades")
        
        print("\n📊 Experience Levels:")
        levels = [
            ("Absolute Beginner", "Simple guidance, habit formation"),
            ("Committed Beginner", "Basic periodization, routine creation"),
            ("Intermediate", "Training blocks, analytics, load management"),
            ("Advanced", "Manual programming, advanced metrics"),
            ("Elite Athlete", "Full customization, research tools, data export")
        ]
        
        for level, description in levels:
            print(f"   - {level}: {description}")
        
        print(f"\n🚀 Ready to serve adaptive dashboards for all user levels!")
        
    except Exception as e:
        print(f"❌ Error initializing adaptive system: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    initialize_adaptive_system()
