const fetch = require('node-fetch');

const API_ENDPOINT = 'https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod';
const API_KEY = '68gmsx2jsk';

async function testMockEndpoint() {
  console.log('Testing /api/v1/mock endpoint...');
  
  // Test preflight request
  const preflightResponse = await fetch(`${API_ENDPOINT}/api/v1/mock`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://recursivelearning.app',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type,x-api-key,X-Project-ID'
    }
  });
  
  console.log('\nPreflight Response:');
  console.log('Status:', preflightResponse.status);
  console.log('CORS Headers:');
  for (const [key, value] of preflightResponse.headers.entries()) {
    if (key.toLowerCase().startsWith('access-control')) {
      console.log(`${key}: ${value}`);
    }
  }

  // Test actual GET request
  const getResponse = await fetch(`${API_ENDPOINT}/api/v1/mock`, {
    method: 'GET',
    headers: {
      'Origin': 'https://recursivelearning.app',
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  console.log('\nGET Response:');
  console.log('Status:', getResponse.status);
  console.log('CORS Headers:');
  for (const [key, value] of getResponse.headers.entries()) {
    if (key.toLowerCase().startsWith('access-control')) {
      console.log(`${key}: ${value}`);
    }
  }
  
  const responseBody = await getResponse.json();
  console.log('Response Body:', responseBody);
}

testMockEndpoint().catch(error => {
  console.error('Error testing mock endpoint:', error);
  process.exit(1);
}); 