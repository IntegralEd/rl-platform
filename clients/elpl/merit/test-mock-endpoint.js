import fetch from 'node-fetch';

const ENDPOINTS = [
  'https://api.recursivelearning.app',
  'https://m9eljjkdn7.execute-api.us-east-2.amazonaws.com/prod'
];
const API_KEY = process.env.API_KEY || '68gmsx2jsk';

async function testEndpoint(endpoint) {
  console.log(`\n🔍 Testing endpoint: ${endpoint}`);
  
  try {
    // Test OPTIONS (CORS preflight)
    console.log('\nTesting CORS preflight...');
    const preflightResponse = await fetch(`${endpoint}/api/v1/mock`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://recursivelearning.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,x-api-key,X-Project-ID,Origin,Authorization'
      }
    });
    
    console.log('Preflight Status:', preflightResponse.status);
    console.log('Preflight Headers:', {
      'Access-Control-Allow-Origin': preflightResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': preflightResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': preflightResponse.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Allow-Credentials': preflightResponse.headers.get('Access-Control-Allow-Credentials')
    });

    // Test GET request
    console.log('\nTesting GET request...');
    const getResponse = await fetch(`${endpoint}/api/v1/mock`, {
      method: 'GET',
      headers: {
        'Origin': 'https://recursivelearning.app',
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('GET Status:', getResponse.status);
    console.log('GET Headers:', {
      'Content-Type': getResponse.headers.get('Content-Type'),
      'Access-Control-Allow-Origin': getResponse.headers.get('Access-Control-Allow-Origin')
    });

    if (getResponse.headers.get('Content-Type')?.includes('application/json')) {
      const data = await getResponse.json();
      console.log('Response Body:', data);
    } else {
      const text = await getResponse.text();
      console.log('Response Text:', text);
    }
    
    if (getResponse.ok) {
      console.log('\n✅ Test successful for', endpoint);
      return true;
    } else {
      console.error('\n❌ Test failed for', endpoint, 'with status:', getResponse.status);
      return false;
    }
  } catch (error) {
    console.error('\n❌ Error testing endpoint:', endpoint, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Gateway tests');
  console.log('Certificate ARN: arn:aws:acm:us-east-2:559050208320:certificate/d1ba7f15-1f1b-400c-942e-c5e5a60ddf8c');
  
  for (const endpoint of ENDPOINTS) {
    await testEndpoint(endpoint);
  }
}

runTests(); 