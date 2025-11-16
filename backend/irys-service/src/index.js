import express from 'express';
import cors from 'cors';
import { Uploader } from '@irys/upload';
import { Solana } from '@irys/upload-solana';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger le .env depuis la racine du projet
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.IRYS_SERVICE_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb', type: 'text/plain' }));

// Initialize Irys uploader
let irysUploader = null;

async function getIrysUploader() {
  if (irysUploader) {
    return irysUploader;
  }

  try {
    const privateKey = process.env.IRYS_PRIVATE_KEY;
    const network = process.env.IRYS_NETWORK || 'devnet';
    const rpcUrl = process.env.SOLANA_RPC_URL;

    if (!privateKey) {
      throw new Error('IRYS_PRIVATE_KEY is not set');
    }

    console.log(`Initializing Irys uploader on ${network}...`);
    
    // Build uploader with Solana - syntaxe correcte du SDK
    let uploaderBuilder = Uploader(Solana).withWallet(privateKey);
    
    if (rpcUrl) {
      uploaderBuilder = uploaderBuilder.withRpc(rpcUrl);
    }

    if (network === 'devnet') {
      uploaderBuilder = uploaderBuilder.devnet();
    }

    irysUploader = await uploaderBuilder;
    
    const address = await irysUploader.address;
    console.log(`Irys uploader initialized on ${network}`);
    console.log(`   Address: ${address}`);
    
    return irysUploader;
  } catch (error) {
    console.error('Failed to initialize Irys uploader:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'irys-service',
    network: process.env.IRYS_NETWORK || 'devnet'
  });
});

// Get uploader info
app.get('/info', async (req, res) => {
  try {
    const uploader = await getIrysUploader();
    const address = await uploader.address;
    const balance = await uploader.getBalance();
    
    res.json({
      address,
      balance: balance.toString(),
      network: process.env.IRYS_NETWORK || 'devnet'
    });
  } catch (error) {
    console.error('Error getting uploader info:', error);
    res.status(500).json({ 
      error: 'Failed to get uploader info',
      message: error.message 
    });
  }
});

// Upload data endpoint
app.post('/upload', async (req, res) => {
  try {
    const uploader = await getIrysUploader();
    
    let data;
    let contentType = 'text/plain';
    
    // Handle different content types
    if (typeof req.body === 'string') {
      data = req.body;
    } else if (req.body.data) {
      data = req.body.data;
      contentType = req.body.contentType || 'text/plain';
    } else {
      return res.status(400).json({ 
        error: 'Invalid request body. Expected string or { data, contentType }' 
      });
    }

    // Prepare tags
    const tags = [
      { name: 'Content-Type', value: contentType },
      { name: 'App-Name', value: 'Lumen-Protocol-v1' }
    ];

    // Add custom tags if provided
    if (req.body.tags && Array.isArray(req.body.tags)) {
      tags.push(...req.body.tags);
    }

    console.log(`Uploading ${data.length} bytes to Irys...`);
    
    const receipt = await uploader.upload(data, { tags });
    
    console.log(`Upload successful. TX ID: ${receipt.id}`);
    
    res.json({
      id: receipt.id,
      timestamp: receipt.timestamp,
      url: `https://gateway.irys.xyz/${receipt.id}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
});

// Get data by transaction ID (proxy to Irys gateway)
app.get('/data/:txId', async (req, res) => {
  try {
    const { txId } = req.params;
    const url = `https://gateway.irys.xyz/${txId}`;
    
    console.log(`Fetching data for TX ID: ${txId}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to fetch data from Irys gateway',
        status: response.status
      });
    }
    
    const data = await response.text();
    console.log(`Retrieved ${data.length} bytes`);
    
    res.send(data);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve data',
      message: error.message 
    });
  }
});

// Fund the uploader (for testing)
app.post('/fund', async (req, res) => {
  try {
    const uploader = await getIrysUploader();
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount. Must be positive integer in lamports' 
      });
    }

    console.log(`Funding uploader with ${amount} lamports...`);
    
    const fundTx = await uploader.fund(amount);
    
    console.log(`Funding successful`);
    
    res.json({
      success: true,
      transaction: fundTx
    });
  } catch (error) {
    console.error('Funding error:', error);
    res.status(500).json({ 
      error: 'Funding failed',
      message: error.message 
    });
  }
});

// Get upload price
app.get('/price/:bytes', async (req, res) => {
  try {
    const uploader = await getIrysUploader();
    const bytes = parseInt(req.params.bytes, 10);
    
    if (isNaN(bytes) || bytes <= 0) {
      return res.status(400).json({ 
        error: 'Invalid bytes parameter' 
      });
    }

    const price = await uploader.getPrice(bytes);
    
    res.json({
      bytes,
      price: price.toString(),
      priceInSol: (Number(price) / 1_000_000_000).toFixed(9)
    });
  } catch (error) {
    console.error('Price check error:', error);
    res.status(500).json({ 
      error: 'Failed to get price',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Irys service running on port ${PORT}`);
  console.log(`   Network: ${process.env.IRYS_NETWORK || 'devnet'}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  
  // Initialize uploader on startup
  getIrysUploader().catch(err => {
    console.error('Failed to initialize uploader on startup:', err);
  });
});

