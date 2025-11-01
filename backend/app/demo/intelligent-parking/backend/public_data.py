import asyncpg
from typing import List, Dict, Any
from datetime import datetime

# --- MODIFIED: Import settings from the new config file ---
from .config import settings

# --- MODIFIED: Use the settings object for database config ---
DB_CONFIG = settings.public_db_config

SENSOR_TABLES = ['capteurtemp', 'capteurlum', 'capteurson', 'capteurgaz', 'capteurproximite']

# --- NEW: Function to clear the public sound sensor table ---
async def clear_public_sound_readings():
    """Deletes all rows from the public 'capteurson' table."""
    conn = None
    try:
        conn = await asyncpg.connect(**DB_CONFIG, timeout=10.0)
        await conn.execute('DELETE FROM "capteurson"')
        print("Public 'capteurson' table has been cleared.")
    except Exception as e:
        # We print a warning but don't raise an exception,
        # so the monitoring can start even if clearing fails.
        print(f"Warning: Failed to clear public 'capteurson' table. Error: {e}")
    finally:
        if conn:
            await conn.close()


async def get_all_sensor_data() -> Dict[str, List[Dict[str, Any]]]:
    all_data = {}
    conn = None
    try:
        frontend_key_mapping = {
            'capteurtemp': 'capteurTemp',
            'capteurlum': 'capteurLum',
            'capteurson': 'capteurSon',
            'capteurgaz': 'capteurGaz',
            'capteurproximite': 'capteurProximite'
        }

        conn = await asyncpg.connect(**DB_CONFIG, timeout=15.0)
        for db_table_name in SENSOR_TABLES:
            query = f"""
                SELECT id, (date + heure) as timestamp, valeur 
                FROM "{db_table_name}"
                ORDER BY timestamp DESC 
                LIMIT 100
            """
            
            records = await conn.fetch(query, timeout=10.0)
            
            frontend_key = frontend_key_mapping[db_table_name]
            all_data[frontend_key] = [dict(r) for r in reversed(records)]

    except (asyncpg.PostgresError, OSError, TimeoutError) as e:
        print(f"Database connection error or timeout: {e}")
        return {"error": "The public data service is currently unavailable or too slow to respond. Please try again later."}
    finally:
        if conn:
            await conn.close()
    return all_data

async def save_sound_reading_to_public_db(value: float):
    conn = None
    try:
        now = datetime.now()
        current_date_obj = now.date()
        current_time_obj = now.time()

        conn = await asyncpg.connect(**DB_CONFIG, timeout=5.0)
        query = 'INSERT INTO "capteurson" (date, heure, valeur) VALUES ($1, $2, $3)'
        await conn.execute(query, current_date_obj, current_time_obj, value)
        
        print(f"Successfully sent reading {value}dB to public database.")
    except Exception as e:
        print(f"Warning: Failed to send reading to public database. Error: {e}")
    finally:
        if conn:
            await conn.close()