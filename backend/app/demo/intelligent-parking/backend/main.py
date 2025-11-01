import asyncio
import serial
import serial.tools.list_ports
import datetime
import pathlib
from fastapi import FastAPI, WebSocket, Depends, HTTPException, status, WebSocketDisconnect, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Dict

from . import auth, database, models, public_data

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "backend" / "static" 

app = FastAPI(title="Parking Intelligent API")

@app.on_event("startup")
async def startup_event():
    await database.setup_database()

# --- MODIFIED: Added tags and summary for better API docs ---
@app.post("/api/signup", status_code=status.HTTP_201_CREATED, tags=["Authentication"], summary="Register a new user")
async def signup(user_data: models.UserSignupRequest):
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les mots de passe ne correspondent pas."
        )
    
    if not auth.is_password_strong(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le mot de passe est trop faible. Il doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
        )

    user = await database.get_user(user_data.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce nom d'utilisateur est déjà pris."
        )

    user_to_create = models.UserCreate(username=user_data.username, password=user_data.password)
    success = await database.create_user(user_to_create)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Impossible de créer l'utilisateur en raison d'une erreur interne."
        )
        
    return {"message": "Utilisateur créé avec succès !"}

# --- MODIFIED: Added tags and summary for better API docs ---
@app.post("/api/token", response_model=models.Token, tags=["Authentication"], summary="Log in to get an access token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await database.get_user(username=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nom d'utilisateur ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- MODIFIED: Added tags and summary for better API docs ---
@app.get("/api/ports", tags=["Monitoring"], summary="List available serial COM ports")
async def get_serial_ports(current_user: models.User = Depends(auth.get_current_user)):
    ports = serial.tools.list_ports.comports()
    return [{"device": port.device, "description": port.description} for port in ports]

# --- MODIFIED: Added tags and summary for better API docs ---
@app.post("/api/readings/clear", status_code=status.HTTP_200_OK, tags=["Data Management"], summary="Clear local sound readings database")
async def clear_readings(current_user: models.User = Depends(auth.get_current_user)):
    await database.clear_all_readings()
    return {"message": "La base de données des lectures locales a été vidée."}

# --- MODIFIED: Added tags and summary for better API docs ---
@app.post("/api/public-sound/clear", status_code=status.HTTP_200_OK, tags=["Data Management"], summary="Clear public sound sensor data table")
async def clear_public_sound_data(current_user: models.User = Depends(auth.get_current_user)):
    await public_data.clear_public_sound_readings()
    return {"message": "Public sound readings have been cleared."}

# --- MODIFIED: Added tags and summary for better API docs ---
@app.get("/api/analytics/sensors", tags=["Analytics"], summary="Get recent data from all public sensors")
async def get_public_sensor_data(current_user: models.User = Depends(auth.get_current_user)):
    data = await public_data.get_all_sensor_data()
    if "error" in data:
        raise HTTPException(status_code=503, detail=data["error"])
    return data

async def serial_data_reader(port_name: str, websocket: WebSocket):
    try:
        ser = serial.Serial(port_name, 9600, timeout=1)
        await asyncio.sleep(2)
        while True:
            line_bytes = ser.readline()
            if line_bytes:
                try:
                    data_str = line_bytes.decode('utf-8').strip()
                    if 'Niveau sonore approx :' in data_str:
                        parts = data_str.split(':')
                        value_str = parts[1].replace('dB', '').strip()
                        value = float(value_str)
                        
                        timestamp = datetime.datetime.now().isoformat()
                        await database.save_reading(timestamp, value)
                        await websocket.send_json({"db": value, "timestamp": timestamp})
                        
                        asyncio.create_task(public_data.save_sound_reading_to_public_db(value))
                        
                except (UnicodeDecodeError, ValueError, IndexError) as e:
                    print(f"Skipping invalid data line: {line_bytes}, Error: {e}")
                    continue
            await asyncio.sleep(0.1)
    except serial.SerialException as e:
        await websocket.send_json({"error": f"Erreur Série: {e}"})
    except Exception as e:
        await websocket.send_json({"error": f"Une erreur inattendue est survenue: {e}"})
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()
            print("Serial port closed.")

# --- MODIFIED: Added tags for better API docs ---
@app.websocket("/ws/{port_name}", name="Live Sound Monitoring")
async def websocket_endpoint(websocket: WebSocket, port_name: str, token: str):
    """
    WebSocket endpoint for live sound monitoring.
    Requires a valid JWT token in the query parameters.
    `port_name` should have slashes (`/`) replaced with three dashes (`---`).
    """
    try:
        user = await auth.get_current_user(token)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    try:
        port_name_decoded = port_name.replace("---", "/")
        await serial_data_reader(port_name_decoded, websocket)
    except WebSocketDisconnect:
        print(f"Client disconnected from WebSocket.")
    except Exception as e:
        print(f"Error in WebSocket handler: {e}")

if (STATIC_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="static-assets")

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa_entrypoint(request: Request):
    index_path = STATIC_DIR / "index.html"
    if index_path.is_file():
        return FileResponse(index_path)
    else:
        raise HTTPException(
            status_code=404,
            detail="Frontend not found. Run 'npm run build' in the 'frontend' directory."
        )