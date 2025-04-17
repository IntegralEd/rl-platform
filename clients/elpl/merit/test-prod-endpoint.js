/**
 * Tests the Lambda API endpoint
 * Uses API key from merit-api-key file
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read API key from file
const API_KEY_PATH = path.join(__dirname, 'merit-api-key');
let MERIT_API_KEY;

try {
    const fileContent = fs.readFileSync(API_KEY_PATH, 'utf8');
    MERIT_API_KEY = fileContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        [0];
    
    if (!MERIT_API_KEY) {
        throw new Error('API key not found in file');
    }
    console.log('✅ API key loaded successfully');
} catch (error) {
    console.error('❌ Error reading merit-api-key file:', error.message);
    process.exit(1);
}

// Test configuration
const endpoint = 'https://api.recursivelearning.app/v1/lambda';
const data = JSON.stringify({
    action: 'create_thread',
    project_id: 'merit',
    thread_id: `test-${Date.now()}`
});

async function runTest() {
    console.log('Testing Lambda endpoint with authentication\n');
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MERIT_API_KEY}`,
            'Content-Length': data.length
        }
    };

    console.log(`🔍 Testing endpoint: ${endpoint} (create_thread)`);
    console.log('Request headers:', {
        ...options.headers,
        'Authorization': 'Bearer [REDACTED]'
    });

    return new Promise((resolve, reject) => {
        const req = https.request(endpoint, options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                switch (res.statusCode) {
                    case 200:
                        console.log('\n🟢 Test complete - successfully authenticated');
                        break;
                    case 401:
                        console.log('\n🔴 Test failed - API key not recognized');
                        break;
                    case 403:
                        if (responseData.includes('token')) {
                            console.log('\n🟡 Test complete - authentication required but token format correct');
                        } else {
                            console.log('\n🔴 Test failed - invalid API key');
                        }
                        break;
                    case 429:
                        console.log('\n🟡 Test complete - rate limit exceeded');
                        break;
                    default:
                        console.log('\n🔴 Test complete - unexpected response status');
                }
                console.log('Response:', responseData);
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.error(`\n❌ Error testing ${endpoint}:`, error.message);
            reject(error);
        });
        
        req.write(data);
        req.end();
    });
}

// Run the tests
runTest();