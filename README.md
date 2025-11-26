<p align="center">
  <img src="./frontend/public/logo.png" alt="Lumen Exchange Logo" width="200">
</p>

<h1 align="center">
  Lumen Exchange v1.0
</h1>

<h3 align="center">
  The central infrastructure and valuation engine for the Lumen Protocol.
</h3>

<p align="center">
    <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.11-blue.svg" alt="Python Version"></a>
    <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.115-009688.svg" alt="FastAPI"></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18-61DAFB.svg" alt="React"></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-336791.svg" alt="Postgres"></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
    <a href="https://github.com/Far3000-YT/lumen/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build Status"></a>
</p>

---

### Table of Contents

-   [Overview](#overview)
-   [Architecture](#architecture)
-   [Project Structure](#project-structure)
-   [Prerequisites](#prerequisites)
-   [Installation & Setup](#installation--setup)
    -   [Environment Configuration](#environment-configuration)
    -   [Docker Deployment](#docker-deployment)
    -   [Database Migrations](#database-migrations)
-   [Development Workflow](#development-workflow)
    -   [Accessing Services](#accessing-services)
    -   [Celery Tasks & Workers](#celery-tasks--workers)
-   [The Valuation Engine](#the-valuation-engine)
-   [License](#license)

---

<h2 id="overview">Overview</h2>

**Lumen Exchange** is the monolithic repository powering the Lumen Protocol. It handles the ingestion of code contributions from the CLI, manages user identities, processes on-chain rewards (Solana/USDC), and hosts the hybrid AI valuation engine.

This repository contains:
1.  **The Core API:** FastAPI backend handling auth, rate-limiting, and business logic.
2.  **The Valuation Engine:** A hybrid system using `pgvector` and Google Gemini to score code quality.
3.  **The Frontends:** Both the Contributor Dashboard (B2C) and the Business Data Explorer (B2B).
4.  **The Worker Nodes:** Celery distributed task queues for processing massive codebases asynchronously.

<h2 id="architecture">Architecture</h2>

The system is containerized using Docker Compose and consists of the following services:

*   **`api`**: FastAPI (Python 3.11) application serving REST endpoints and WebSockets.
*   **`worker`**: Celery workers for heavy lifting (valuation, unzip, sanitization).
*   **`db`**: PostgreSQL 16 equipped with the **`pgvector`** extension for high-performance semantic code search.
*   **`redis`**: In-memory data store for caching, rate-limiting, and Celery message brokering.
*   **`frontend`**: Contributor dashboard built with React, Vite, and TailwindCSS.
*   **`business_frontend`**: B2B Data Explorer dashboard.
*   **`irys`**: A local microservice/gateway for interacting with the Irys decentralized storage network.
*   **`nginx`**: Reverse proxy handling SSL termination and routing.

<h2 id="project-structure">Project Structure</h2>

```text
lumen-exchange/
├── backend/              # Core Python API & Workers
│   ├── app/
│   │   ├── api/          # V1 Endpoints (Auth, Users, Contributions)
│   │   ├── core/         # Config, Security, Celery settings
│   │   ├── db/           # SQLAlchemy Models & CRUD
│   │   ├── services/     # Valuation, GitHub, Solana, Irys logic
│   │   └── tasks.py      # Celery Task Definitions
│   ├── migrations/       # Alembic DB Migrations
│   └── irys-service/     # Node.js microservice for storage
├── frontend/             # Contributor Dashboard (React)
├── business-frontend/    # B2B Data Explorer (React)
├── certbot/              # SSL Configuration
├── nginx/                # Nginx Configs
└── docker-compose.yml    # Production orchestration
```

<h2 id="prerequisites">Prerequisites</h2>

*   **Docker** & **Docker Compose** (Essential)
*   **Node.js 18+** (Only if developing frontends locally without Docker)
*   **Python 3.11+** (Only if developing backend locally without Docker)
*   **Solana Wallet Keypair** (For handling payouts)
*   **Google Gemini API Key** (For the valuation engine)

<h2 id="installation--setup">Installation & Setup</h2>

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/lumen-exchange.git
cd lumen-exchange
```

<h3 id="environment-configuration">2. Environment Configuration</h3>

Create a `.env` file in the root directory. You can base it on the example below.
**Note:** Never commit your real `.env` to version control.

```ini
# --- Database ---
POSTGRES_USER=lumen_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=lumen_exchange
DATABASE_URL=postgresql://lumen_user:secure_password@db:5432/lumen_exchange

# --- Security ---
SECRET_KEY=your_generated_openssl_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENCRYPTION_KEY=your_fernet_key_for_2fa_secrets

# --- External APIs ---
GEMINI_API_KEY=your_google_gemini_key
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
GITHUB_SEARCH_PAT=your_github_pat_for_search

# --- Blockchain (Solana) ---
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# JSON Array format for private keys
TREASURY_PRIVATE_KEY=[123, 45, ...] 
AIRDROP_WALLET_PRIVATE_KEY=[123, 45, ...]
LUM_TOKEN_MINT_ADDRESS=your_token_mint_address
USDC_TOKEN_MINT_ADDRESS=usdc_mint_address

# --- App Config ---
VALUATION_MODE=AI  # Options: AI, MANUAL
BETA_MODE_ENABLED=True
```

<h3 id="docker-deployment">3. Docker Deployment</h3>

We provide a `docker-compose.dev.yml` for local development which includes hot-reloading.

```bash
# Build and start all services
docker-compose -f docker-compose.dev.yml up --build
```

This will start the database, Redis, backend API, Celery workers, and both frontends.

<h3 id="database-migrations">4. Database Migrations</h3>

Once the containers are running, you must apply the database schema using Alembic.

```bash
# Run inside the 'api' container
docker-compose -f docker-compose.dev.yml exec api alembic upgrade head
```

<h2 id="development-workflow">Development Workflow</h2>

<h3 id="accessing-services">Accessing Services</h3>

Once Docker is running, the services are available at:

| Service | URL | Description |
| :--- | :--- | :--- |
| **API Docs** | `http://localhost:8000/docs` | Swagger UI for Backend |
| **Contributor App** | `http://localhost:5173` | Main user dashboard |
| **Business App** | `http://localhost:5174` | Data Explorer dashboard |
| **Database** | `localhost:5433` | Mapped externally (User: lumen_user) |

<h3 id="celery-tasks--workers">Celery Tasks & Workers</h3>

The system relies heavily on background workers. Here are common commands to trigger tasks manually during development.

**Trigger Network Stats Recalculation**
*Useful after wiping DB or massive updates.*
```bash
docker-compose -f docker-compose.dev.yml exec worker celery -A app.core.celery_app.celery_app call app.tasks.recalculate_network_stats_task
```

**Simulate Daily Payout Batch**
*Runs the logic to calculate payouts without executing on-chain transactions.*
```bash
docker-compose -f docker-compose.dev.yml exec worker celery -A app.core.celery_app.celery_app call app.tasks.simulate_daily_payout_batch_task
```

**Reset User Limits (Dev Only)**
*Resets the daily contribution limit for a specific user ID (e.g., ID 1).*
```bash
docker-compose -f docker-compose.dev.yml exec worker celery -A app.core.celery_app.celery_app call app.tasks.reset_user_limits_task --args='[1]'
```

<h2 id="the-valuation-engine">The Valuation Engine</h2>

Located in `backend/app/services/valuation.py`, this is the heart of the protocol.

1.  **Quantitative Analysis:** Calculates Logical Lines of Code (LLOC), cyclomatic complexity, and compression ratios.
2.  **Uniqueness Check:** Generates embeddings for the submitted code and queries `pgvector` to find semantic duplicates in the network history.
3.  **Qualitative Analysis:** Sends a sanitized prompt to **Google Gemini 2.5** to assess architectural quality, clarity, and potential plagiarism.

<h2 id="license">License</h2>

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.