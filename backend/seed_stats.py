from app.db.database import SessionLocal
from app.db.models import NetworkStats

db = SessionLocal()
if not db.query(NetworkStats).first():
    print("Seeding initial network stats...")
    initial_stats = NetworkStats()
    db.add(initial_stats)
    db.commit()
    print("Done.")
else:
    print("Network stats already exist.")
db.close()