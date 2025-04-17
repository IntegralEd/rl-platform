/**
 * Tests the Lambda API endpoint
 * Uses production API key and endpoint
 */

const https = require('https');

// Production configuration
const CONFIG = {
    endpoint: 'https://api.recursivelearning.app/prod',
    org_id: 'recdg5Hlm3VVaBA2u',
    assistant_id: 'asst_QoAA395ibbyMImFJERbG2hKT',
    schema_version: '04102025.B01',
    'x-api-key': 'qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J'
};

const data = JSON.stringify({
    action: 'create_thread',
    org_id: CONFIG.org_id,
    assistant_id: CONFIG.assistant_id,
    schema_version: CONFIG.schema_version
});

async function runTest() {
    console.log('Testing Lambda endpoint with authentication\n');
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CONFIG['x-api-key'],
            'Content-Length': data.length
        }
    };

    console.log(`🔍 Testing endpoint: ${CONFIG.endpoint} (create_thread)`);
    console.log('Request headers:', {
        ...options.headers,
        'x-api-key': '[REDACTED]'
    });
    console.log('Request body:', JSON.parse(data));

    return new Promise((resolve, reject) => {
        const req = https.request(CONFIG.endpoint, options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(responseData);
                    console.log('\nResponse:', JSON.stringify(jsonResponse, null, 2));
                    
                    switch (res.statusCode) {
                        case 200:
                            console.log('\n🟢 Test complete - successfully authenticated');
                            if (jsonResponse.thread_id) {
                                console.log(`Thread ID: ${jsonResponse.thread_id}`);
                            }
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
                            console.log('\n🔴 Test complete - unexpected response status:', res.statusCode);
                    }
                } catch (error) {
                    console.log('\nRaw response:', responseData);
                }
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.error(`\n❌ Error testing ${CONFIG.endpoint}:`, error.message);
            reject(error);
        });
        
        req.write(data);
        req.end();
    });
}

// Run the tests
runTest();