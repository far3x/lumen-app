# Parking Intelligent - Sound Monitoring Web App

This project provides a web interface to monitor real-time sound levels captured by a microcontroller (e.g., `Tiva`, `Arduino`) equipped with a microphone sensor.

## Features

- **Real-time Monitoring:** View live sound levels (`dB`) via a clean web dashboard.
- **Secure Access:** `JWT`-based authentication for user `login` and `signup`.
- **Dynamic Port Selection:** Automatically detects and lists available serial ports.
- **Visual Feedback:** A color-coded progress bar (`green`, `yellow`, `red`) visualizes the sound intensity.
- **High-Level Alerts:** Triggers a visual alert on the dashboard when sound levels exceed a defined threshold.
- **Data Persistence:** Sound readings and user data are stored in an `SQLite` database.
- **Modern Tech Stack:** Built with `FastAPI` (`Python`) for the backend and vanilla `HTML/CSS/JS` for the frontend.

## Setup and Running the Project

### Prerequisites

1.  **`Python 3.8+`**
2.  **A microcontroller** (like an `Arduino` or `Tiva C`) flashed with the `Code_Son/Code_Son.ino` sketch.
3.  The microcontroller connected to your computer via `USB`.

### 1. Backend Setup

First, navigate to the `backend` directory and install the required `Python` packages.

``
cd backend
pip install -r requirements.txt
``

### 2. Flash the Microcontroller

- Open the `Code_Son/Code_Son.ino` file in the `Arduino IDE` (or equivalent for your board).
- Select the correct board and port from the `Tools` menu.
- Upload the sketch to your microcontroller.

### 3. Run the Web Server

From inside the `backend` directory, start the `FastAPI` server using `Uvicorn`.

``
uvicorn main:app --reload
``

The `--reload` flag automatically restarts the server when you make changes to the code.

### 4. Access the Website

Open your web browser and navigate to:

[http://127.0.0.1:8000](http://127.0.0.1:8000)

You will be redirected to the `login` page.

- **`Sign up`** for a new account.
- **`Log in`** with your new credentials.
- On the main dashboard, **select the correct serial port** for your microcontroller from the dropdown list.
- Click **`Start Monitoring`** to see the live data.