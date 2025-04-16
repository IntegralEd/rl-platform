/**
 * Merit Production Endpoint Health Check
 * Tests the new production API endpoint
 */

const ENDPOINTS = {
    direct: 'https://29wtfiieig.execute-api.us-east-2.amazonaws.com/dev',
    prod: 'https://api.recursivelearning.app/prod',
    lambda: 'https://api.recursivelearning.app/v1/lambda'
};

const CONFIG = {
    org_id: 'recdg5Hlm3VVaBA2u',
    assistant_id: 'asst_QoAA395ibbyMImFJERbG2hKT',
    model: 'gpt-4o',
    schema_version: '04102025.B01',
    project_id: 'proj_V4lrL1OSfydWCFW0zjgwrFRT'
};

async function testEndpoint(endpoint, test = 'ping') {
    console.log(`\n🔍 Testing endpoint: ${endpoint} (${test})`);
    
    try {
        let url = endpoint;
        let method = 'GET';
        let body = null;
        
        // Configure test specific parameters
        if (test === 'create_thread') {
            method = 'POST';
            body = {
                action: 'create_thread',
                ...CONFIG
            };
        }
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Project-ID': CONFIG.project_id,
                'X-Org-ID': CONFIG.org_id
            },
            ...(body && { body: JSON.stringify(body) })
        });

        console.log(`\n✅ Response Status: ${response.status}`);
        
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
            console.log('Response Data:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Response Body:', text || 'Empty response');
        }

        return {
            endpoint,
            test,
            status: response.status,
            data: data || text
        };
    } catch (error) {
        console.error(`\n❌ Connection Failed to ${endpoint}:`);
        console.error('------------------------');
        console.error('Error:', error.message);
        return {
            endpoint,
            test,
            status: 'error',
            error: error.message
        };
    }
}

// Test endpoints independently
async function runTests() {
    console.log('🚀 Starting endpoint health checks...');
    console.log('Testing all endpoints with authentication');
    
    const results = [];
    
    // Test direct API Gateway URL
    console.log('\n📡 Testing Direct API Gateway URL...');
    results.push(await testEndpoint(ENDPOINTS.direct, 'create_thread'));
    
    // Test production endpoint
    console.log('\n📡 Testing Production Endpoint...');
    results.push(await testEndpoint(ENDPOINTS.prod, 'create_thread'));
    
    // Test lambda endpoint
    console.log('\n📡 Testing Lambda Endpoint...');
    results.push(await testEndpoint(ENDPOINTS.lambda, 'create_thread'));
    
    // Compare results
    console.log('\n📊 Results Comparison:');
    console.log('------------------------');
    for (const result of results) {
        const statusEmoji = result.status === 'error' ? '❌' : '✅';
        const details = result.status === 'error' 
            ? `Failed - ${result.error}`
            : `${result.status} ${typeof result.data === 'object' ? '(JSON response)' : '(text response)'}`;
        console.log(`${result.endpoint} (${result.test}): ${statusEmoji} ${details}`);
    }
    
    // Check if any endpoint succeeded
    const hasSuccess = results.some(r => r.status !== 'error' && r.status < 500);
    if (!hasSuccess) {
        console.error('\n🔴 All endpoints failed');
        process.exit(1);
    } else {
        console.log('\n🟢 Test complete - at least one endpoint succeeded');
        process.exit(0);
    }
}

// Run the tests
runTests(); 