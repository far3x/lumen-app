import aiosqlite
import pathlib
from .models import UserInDB

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
DATABASE_FILE = BASE_DIR / 'mic_data.db'


async def setup_database():
    async with aiosqlite.connect(DATABASE_FILE) as db:
        await db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                adc_value REAL NOT NULL
            )
        ''')
        await db.commit()

async def get_user(username: str):
    async with aiosqlite.connect(DATABASE_FILE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM users WHERE username = ?", (username,))
        user_row = await cursor.fetchone()
        if user_row:
            return UserInDB(**user_row)
    return None

async def create_user(user_data):
    # This import now correctly points to our new bcrypt-based functions
    from .auth import get_password_hash
    
    # --- FIX: Ensure we use the string password from the Pydantic model ---
    hashed_password = get_password_hash(user_data.password)
    
    async with aiosqlite.connect(DATABASE_FILE) as db:
        try:
            await db.execute(
                "INSERT INTO users (username, hashed_password) VALUES (?, ?)",
                (user_data.username, hashed_password)
            )
            await db.commit()
            return True
        except aiosqlite.IntegrityError:
            return False

async def save_reading(timestamp: str, value: float):
    async with aiosqlite.connect(DATABASE_FILE) as db:
        await db.execute(
            "INSERT INTO readings (timestamp, adc_value) VALUES (?, ?)",
            (timestamp, value)
        )
        await db.commit()

# --- NEW: Function to clear all sound readings from the local DB ---
async def clear_all_readings():
    """Deletes all rows from the 'readings' table."""
    async with aiosqlite.connect(DATABASE_FILE) as db:
        await db.execute("DELETE FROM readings")
        await db.commit()
        print("Local readings database has been cleared.")