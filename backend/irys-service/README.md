# Irys Microservice

Service Node.js pour gérer les opérations de stockage Irys (upload/récupération de données).

## Installation

```bash
npm install
```

## Configuration

Copier `.env.example` vers `.env` et configurer les variables.

## Démarrage

```bash
npm start        # Production
npm run dev      # Dev avec watch mode
```

## API Endpoints

- `GET /health` - Health check
- `GET /info` - Info du uploader (adresse, balance)
- `POST /upload` - Upload de données
- `GET /data/:txId` - Récupération de données
- `POST /fund` - Financer le compte Irys
- `GET /price/:bytes` - Prix d'upload pour X bytes

## Exemple d'utilisation

```bash
# Upload
curl -X POST http://localhost:3001/upload \
  -H "Content-Type: text/plain" \
  -d "Hello Irys!"

# Récupération
curl http://localhost:3001/data/TRANSACTION_ID
```

