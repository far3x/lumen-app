<p align="center">
  <img src="./frontend/public/logo2.png" alt="Lumen Exchange Logo" width="200">
</p>

<h1 align="center">
  Lumen App - v2.0
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
</p>



### Table of Contents

-   [About & Evolution](#about--evolution)
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
-   [Security Note](#security-note)
-   [License](#license)



<h2 id="about--evolution">About & Evolution</h2>

**Lumen Protocol** began as `pylumen`, a simple local CLI tool designed to help developers generate context prompts for LLMs. As usage grew, it became clear that this high-quality, human-written code was the missing link in the AI data economy.

**Lumen App v2.0** is the evolution of that idea into a robust, decentralized platform. This repository acts as the "Mothership": it handles the ingestion of code contributions from the CLI, manages user identities, processes on-chain rewards (Solana/USDC), and hosts the hybrid AI valuation engine that appraises code quality in real-time.

<h2 id="architecture">Architecture</h2>

The system is containerized using Docker Compose and consists of the following microservices:

*   **`api`**: The core backend built with **FastAPI (Python 3.11)**. It handles authentication, rate-limiting, and serves the REST API.
*   **`worker`**: Distributed **Celery** workers that handle heavy lifting: unpacking codebases, running local analysis, generating embeddings, and querying the AI valuation engine.
*   **`db`**: **PostgreSQL 16** equipped with the **`pgvector`** extension for high-performance semantic code search and uniqueness verification.
*   **`redis`**: In-memory data store used for caching, rate-limiting, and as the Celery message broker.
*   **`frontend`**: The Contributor Dashboard (B2C) built with **React, Vite, and TailwindCSS**.
*   **`business_frontend`**: The Data Explorer Dashboard (B2B) for enterprise data customers.
*   **`irys`**: A local Node.js gateway for interacting with the **Irys** decentralized storage network.
*   **`nginx`**: Reverse proxy handling routing, SSL termination, and static file serving.

<h2 id="project-structure">Project Structure</h2>

```text
lumen-app/
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
└── docker compose.yml    # Production orchestration
```

<h2 id="prerequisites">Prerequisites</h2>

*   **Docker** & **Docker Compose** (Essential)
*   **Python 3.11+** (If running scripts locally)
*   **Node.js 18+** (If building frontends locally)
*   **Solana Wallet** (Phantom/Backpack for testing payments)
*   **Google Gemini API Key** (Required for the valuation engine)

<h2 id="installation--setup">Installation & Setup</h2>

### 1. Clone the repository
```bash
git clone https://github.com/far3x/lumen-app.git
cd lumen-app/
```

<h3 id="environment-configuration">2. Environment Configuration</h3>

Create a `.env` file in the root directory. Copy the block below and fill in your keys.
**Note:** Default values are provided for local development where applicable.

```ini
# -----------------------------------------------------------------------------
# GENERAL SETTINGS
# -----------------------------------------------------------------------------
DEV_MODE=True
FRONTEND_URL=http://localhost:5173
BUSINESS_FRONTEND_URL=http://localhost:5174
VITE_API_URL=http://localhost:8000
API_URL=http://localhost:8000
PUBLIC_LOGO_URL=https://i.imgur.com/8IqIjIS.jpeg

# -----------------------------------------------------------------------------
# SECURITY
# Use 'openssl rand -hex 32' to generate secure keys
# -----------------------------------------------------------------------------
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
# Use a Fernet key for 2FA encryption
ENCRYPTION_KEY=bi1rX2V4YW1wbGVfa2V5X2dlbmVyYXRlZF9mb3JfZGVtb189
LUMEN_CLIENT_SECRET=cli_client_secret_example_123

# -----------------------------------------------------------------------------
# VALUATION ENGINE (AI)
# -----------------------------------------------------------------------------
VALUATION_MODE=AI
GEMINI_MODEL_NAME=gemini-2.5-flash
GEMINI_TEMPERATURE=0.2
# Your Google AI Studio API Key
GEMINI_API_KEY=AIzaSyD_ExampleKeyForGeminiModel_12345

# -----------------------------------------------------------------------------
# DATABASE (PostgreSQL)
# -----------------------------------------------------------------------------
POSTGRES_USER=lumen_user
POSTGRES_PASSWORD=secure_db_password_123
POSTGRES_DB=lumen_exchange
# Connection string for the backend
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
# Password for PgBouncer (Connection Pooler)
PGBOUNCER_PASSWORD=secure_db_password_123

# -----------------------------------------------------------------------------
# REDIS & CELERY
# -----------------------------------------------------------------------------
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# -----------------------------------------------------------------------------
# PROTOCOL SETTINGS
# -----------------------------------------------------------------------------
COOLDOWN_DAYS=14
BETA_MODE_ENABLED=True
BETA_MAX_USERS=200
BETA_GENESIS_BONUS=1000

# -----------------------------------------------------------------------------
# EMAIL SERVICE (Mailjet)
# -----------------------------------------------------------------------------
MAIL_SERVER=in-v3.mailjet.com
MAIL_PORT=587
MAIL_FROM=noreply@lumen.onl
MAIL_FROM_NAME=Lumen Protocol
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
MAIL_USERNAME=your_mailjet_public_key
MAIL_PASSWORD=your_mailjet_secret_key

# -----------------------------------------------------------------------------
# THIRD PARTY SERVICES
# -----------------------------------------------------------------------------
# Google reCAPTCHA v2 keys
GOOGLE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
GOOGLE_RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

# GitHub OAuth Application Keys
GITHUB_CLIENT_ID=Ov23li...
GITHUB_CLIENT_SECRET=a1b2c3d4...
# GitHub Personal Access Token for code search (classic token)
GITHUB_SEARCH_PAT=ghp_example_token_for_searching_code

# Birdeye API for Token Prices
BIRDEYE_API_KEY=def456...

# WalletConnect Project ID (Reown)
VITE_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6...

# -----------------------------------------------------------------------------
# BLOCKCHAIN (Solana)
# -----------------------------------------------------------------------------
# Use publicnode url for better reliability without auth
SOLANA_RPC_URL=https://solana-rpc.publicnode.com

# Keypair for the Treasury Wallet (JSON Array Format)
TREASURY_PRIVATE_KEY=[162, 25, 44, 74, 22, 11, 200, 199, ...]

# Keypair for the Airdrop Wallet (JSON Array Format)
AIRDROP_WALLET_PRIVATE_KEY=[12, 44, 66, 88, ...]

# Token Mint Addresses (Mainnet or Devnet)
USDC_TOKEN_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
LUM_TOKEN_MINT_ADDRESS=LUMEN111111111111111111111111111111111111
AIRDROP_TOKEN_MINT_ADDRESS=DROP11111111111111111111111111111111111

# -----------------------------------------------------------------------------
# IRYS STORAGE (Decentralized)
# -----------------------------------------------------------------------------
# Private key for the wallet paying for Irys storage
IRYS_PRIVATE_KEY=a1b2c3d4...
IRYS_NETWORK=mainnet
IRYS_TOKEN=solana
```

<h3 id="docker-deployment">3. Docker Deployment</h3>

We provide a `docker compose.dev.yml` for local development which includes hot-reloading for both Python and React services.

```bash
# Build and start all services
docker compose -f docker compose.dev.yml up --build
```

This will spin up the entire stack. You can access:
*   **Contributor Frontend:** `http://localhost:5173`
*   **Business Frontend:** `http://localhost:5174`
*   **API Documentation:** `http://localhost:8000/docs`

<h3 id="database-migrations">4. Database Migrations</h3>

On the first run, you must apply the database schema. The `pgvector` extension is enabled automatically by the Docker image.

```bash
# Run inside the 'api' container
docker compose -f docker compose.dev.yml exec api alembic upgrade head
```

<h2 id="development-workflow">Development Workflow</h2>

<h3 id="accessing-services">Accessing Services</h3>

To access the database locally (e.g., via DBeaver or TablePlus), use port **5433** (mapped to internal 5432).
*   **Host:** `localhost`
*   **Port:** `5433`
*   **User:** `lumen_user`
*   **Database:** `lumen_exchange`

<h3 id="celery-tasks--workers">Celery Tasks & Workers</h3>

The system relies on background workers for valuation. Here are useful commands for testing and maintenance:

**Trigger Network Stats Recalculation**
*Useful after deleting contributions or resetting the DB.*
```bash
docker compose -f docker compose.dev.yml exec worker celery -A app.core.celery_app.celery_app call app.tasks.recalculate_network_stats_task
```

**Simulate Daily Payout Batch**
*Runs the payout logic (reading balances) without executing on-chain transactions.*
```bash
docker compose -f docker compose.dev.yml exec worker celery -A app.core.celery_app.celery_app call app.tasks.simulate_daily_payout_batch_task
```

**Reset User Limits (Dev Only)**
*Resets the daily contribution limit for a specific user ID (e.g., User 1).*
```bash
docker compose -f docker compose.dev.yml exec worker celery -A app.core.celery_app.celery_app call app.tasks.reset_user_limits_task --args='[1]'
```

<h2 id="the-valuation-engine">The Valuation Engine</h2>

Located in `backend/app/services/valuation.py`, this is the proprietary heart of the protocol. It assesses code value in three stages:

1.  **Quantitative Analysis:** Calculates Logical Lines of Code (LLOC), cyclomatic complexity, and compression ratios to determine "substance."
2.  **Uniqueness Check:** Generates high-dimensional embeddings for the code and queries `pgvector` to find semantic duplicates across the entire network history, preventing plagiarism.
3.  **Qualitative Analysis:** Sends a sanitized, context-aware prompt to **Google Gemini 2.5** to assess architectural quality, clarity, and potential open-source copying.

<h2 id="security-note">Security Note</h2>

This repository has been sanitized using `git-filter-repo` to remove all historical traces of:
*   SSL Certificates (`certbot/`).
*   Database dumps (`.sql`).
*   Internal logs and instructions.

The commit history has been rewritten. If you have any question, do not hesitate to DM @far3000 (on discord) or @Far3k (on telegram) or @far3xbt (on X) (i never dm first !)

<h2 id="license">License</h2>

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.