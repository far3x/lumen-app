/**
 * Script de test simple pour vérifier le microservice Irys
 */

const BASE_URL = process.env.IRYS_SERVICE_URL || 'http://localhost:3001';

async function testHealthCheck() {
  console.log('\n🔍 Test 1: Health Check');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check:', data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

async function testInfo() {
  console.log('\n🔍 Test 2: Uploader Info');
  try {
    const response = await fetch(`${BASE_URL}/info`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    const data = await response.json();
    console.log('✅ Uploader info:');
    console.log(`   Address: ${data.address}`);
    console.log(`   Balance: ${data.balance} lamports`);
    console.log(`   Network: ${data.network}`);
  } catch (error) {
    console.error('❌ Info check failed:', error.message);
  }
}

async function testUpload() {
  console.log('\n🔍 Test 3: Upload Data');
  try {
    const testData = `Test upload at ${new Date().toISOString()}\nHello Irys from Lumen!`;
    
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: testData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    
    const result = await response.json();
    console.log('✅ Upload successful:');
    console.log(`   TX ID: ${result.id}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Timestamp: ${result.timestamp}`);
    
    return result.id;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    return null;
  }
}

async function testRetrieve(txId) {
  if (!txId) {
    console.log('\n⏭️  Skipping retrieve test (no TX ID)');
    return;
  }
  
  console.log('\n🔍 Test 4: Retrieve Data');
  try {
    const response = await fetch(`${BASE_URL}/data/${txId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    
    const data = await response.text();
    console.log('✅ Data retrieved:');
    console.log(data);
  } catch (error) {
    console.error('❌ Retrieve failed:', error.message);
  }
}

async function testPrice() {
  console.log('\n🔍 Test 5: Check Prices');
  try {
    const sizes = [100, 1024, 102400, 1048576]; // 100B, 1KB, 100KB, 1MB
    
    for (const size of sizes) {
      const response = await fetch(`${BASE_URL}/price/${size}`);
      if (!response.ok) {
        throw new Error(`Failed to get price for ${size} bytes`);
      }
      const data = await response.json();
      console.log(`   ${(size/1024).toFixed(2).padStart(10)} KB → ${data.priceInSol} SOL`);
    }
    console.log('✅ Price check complete');
  } catch (error) {
    console.error('❌ Price check failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Irys Service Tests');
  console.log(`   Target: ${BASE_URL}`);
  
  await testHealthCheck();
  await testInfo();
  const txId = await testUpload();
  
  if (txId) {
    console.log('\n⏳ Waiting 3 seconds before retrieval...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await testRetrieve(txId);
  }
  
  await testPrice();
  
  console.log('\n✨ Tests complete!\n');
}

runTests().catch(console.error);

