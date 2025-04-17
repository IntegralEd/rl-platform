/**
 * Merit Production Endpoint Health Check
 * Tests the new production API endpoint
 */

const ENDPOINTS = {
    prod: 'https://api.recursivelearning.app/prod'
};

const CONFIG = {
    org_id: 'recdg5Hlm3VVaBA2u',
    assistant_id: 'asst_QoAA395ibbyMImFJERbG2hKT',
    schema_version: '04102025.B01'
};

async function runTest() {
    if (!process.env.MERIT_API_KEY) {
        console.error('❌ Error: MERIT_API_KEY environment variable is not set');
        process.exit(1);
    }

    console.log('🚀 Starting endpoint health check...');
    console.log('Testing production endpoint with authentication\n');

    const endpoint = `${ENDPOINTS.prod}?apikey=${process.env.MERIT_API_KEY}`;
    
    console.log(`🔍 Testing endpoint: ${ENDPOINTS.prod} (create_thread)`);
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.MERIT_API_KEY
            },
            body: JSON.stringify({
                action: 'create_thread',
                org_id: CONFIG.org_id,
                assistant_id: CONFIG.assistant_id,
                schema_version: CONFIG.schema_version
            })
        });

        const data = await response.json();
        
        console.log(`\n✅ Response Status: ${response.status}`);
        console.log('Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 403) {
            if (data.message === 'Missing Authentication Token') {
                console.log('\n🔴 Test failed - API key not recognized');
                console.log('Headers sent:', {
                    'Content-Type': 'application/json',
                    'x-api-key': '[REDACTED]'
                });
                console.log('API Key also sent as query parameter');
            } else {
                console.log('\n🟡 Test complete - authentication required but token format correct');
            }
        } else if (response.status === 401) {
            console.log('\n🔴 Test failed - invalid API key');
        } else if (response.status === 200) {
            console.log('\n🟢 Test complete - successfully authenticated');
            if (data.thread_id) {
                console.log(`Thread ID: ${data.thread_id}`);
            }
        } else if (response.status === 429) {
            console.log('\n🟡 Test complete - rate limit exceeded');
        } else {
            console.log('\n🔴 Test complete - unexpected response status');
        }
    } catch (error) {
        console.error(`\n❌ Error testing ${endpoint}:`, error.message);
        process.exit(1);
    }
}

// Run the tests
runTest();