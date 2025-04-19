/**
 * Tests the Lambda API endpoint and API Gateway endpoint
 * Uses production API keys and endpoints
 */

const https = require('https');

// Production configuration
const CONFIG = {
    lambda: {
        endpoint: 'https://api.recursivelearning.app/prod',
        org_id: 'recdg5Hlm3VVaBA2u',
        assistant_id: 'asst_QoAA395ibbyMImFJERbG2hKT',
        schema_version: '04102025.B01',
        'x-api-key': 'qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J'
    },
    apiGateway: {
        endpoint: 'https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod/api/v1/context',
        org_id: 'recdg5Hlm3VVaBA2u',
        assistant_id: 'asst_QoAA395ibbyMImFJERbG2hKT',
        schema_version: '04102025.B01',
        'x-api-key': '68gmsx2jsk'
    }
};

// Test CORS preflight first
async function testCORSPreflight() {
    console.log('\n📌 Testing CORS preflight request\n');
    
    const options = {
        method: 'OPTIONS',
        headers: {
            'Origin': 'https://recursivelearning.app',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,x-api-key,X-Project-ID'
        }
    };

    console.log(`🔍 Testing endpoint: ${CONFIG.apiGateway.endpoint}`);
    console.log('Request headers:', options.headers);

    return new Promise((resolve, reject) => {
        const req = https.request(CONFIG.apiGateway.endpoint, options, (res) => {
            console.log('\nCORS Headers Check:');
            console.log(`Status Code: ${res.statusCode}`);
            console.log(`Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'Not present'}`);
            console.log(`Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'Not present'}`);
            console.log(`Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'Not present'}`);
            console.log(`Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'Not present'}`);
            
            if (res.statusCode === 200) {
                console.log('\n🟢 CORS preflight successful');
            } else {
                console.log('\n🔴 CORS preflight failed');
            }
            resolve();
        });
        
        req.on('error', (error) => {
            console.error('\n❌ CORS preflight error:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

// Create test data for Lambda
const lambdaData = JSON.stringify({
    action: 'create_thread',
    org_id: CONFIG.lambda.org_id,
    assistant_id: CONFIG.lambda.assistant_id,
    schema_version: CONFIG.lambda.schema_version
});

// Create test data for API Gateway
const apiGatewayData = JSON.stringify({
    action: 'create_thread',
    org_id: CONFIG.apiGateway.org_id,
    assistant_id: CONFIG.apiGateway.assistant_id,
    schema_version: CONFIG.apiGateway.schema_version
});

async function testLambdaEndpoint() {
    console.log('📌 Testing Lambda endpoint with authentication\n');
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CONFIG.lambda['x-api-key'],
            'Content-Length': lambdaData.length
        }
    };

    console.log(`🔍 Testing endpoint: ${CONFIG.lambda.endpoint} (create_thread)`);
    console.log('Request headers:', {
        ...options.headers,
        'x-api-key': '[REDACTED]'
    });
    console.log('Request body:', JSON.parse(lambdaData));

    return new Promise((resolve, reject) => {
        const req = https.request(CONFIG.lambda.endpoint, options, (res) => {
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
            console.error(`\n❌ Error testing ${CONFIG.lambda.endpoint}:`, error.message);
            reject(error);
        });
        
        req.write(lambdaData);
        req.end();
    });
}

async function testApiGatewayEndpoint() {
    console.log('\n\n📌 Testing API Gateway endpoint with authentication\n');
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CONFIG.apiGateway['x-api-key'],
            'Origin': 'https://recursivelearning.app',
            'Content-Length': apiGatewayData.length
        }
    };

    console.log(`🔍 Testing endpoint: ${CONFIG.apiGateway.endpoint} (create_thread)`);
    console.log('Request headers:', {
        ...options.headers,
        'x-api-key': '[REDACTED]'
    });
    console.log('Request body:', JSON.parse(apiGatewayData));

    // Parse URL for request
    const url = new URL(CONFIG.apiGateway.endpoint);
    
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: url.hostname,
            path: url.pathname,
            method: options.method,
            headers: options.headers
        }, (res) => {
            let responseData = '';
            
            console.log(`\nCORS Headers Check:`);
            console.log(`Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'Not present'}`);
            console.log(`Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'Not present'}`);
            console.log(`Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'Not present'}`);
            
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
            console.error(`\n❌ Error testing ${CONFIG.apiGateway.endpoint}:`, error.message);
            reject(error);
        });
        
        req.write(apiGatewayData);
        req.end();
    });
}

// Run the tests
async function runTests() {
    try {
        await testCORSPreflight();
        await testLambdaEndpoint();
        await testApiGatewayEndpoint();
        console.log('\n\n✅ All tests completed');
    } catch (error) {
        console.error('\n❌ Test suite error:', error.message);
    }
}

runTests();