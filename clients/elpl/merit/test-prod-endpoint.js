/**
 * Merit Production Endpoint Health Check
 * Tests the new production API endpoint
 */

const ENDPOINTS = {
    lambda: 'https://api.recursivelearning.app/v1/lambda'
};

const ROUTES = {
    create_thread: '/create_thread'
};

const CONFIG = {
    project_id: 'proj_V4lrL1OSfydWCFW0zjgwrFRT'
};

async function runTest() {
    if (!process.env.MERIT_API_KEY) {
        console.error('❌ Error: MERIT_API_KEY environment variable is not set');
        process.exit(1);
    }

    console.log('🚀 Starting endpoint health check...');
    console.log('Testing lambda endpoint with authentication\n');

    const endpoint = ENDPOINTS.lambda;
    const route = ROUTES.create_thread;
    
    console.log(`🔍 Testing endpoint: ${endpoint} (create_thread)`);
    
    try {
        const response = await fetch(`${endpoint}${route}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': process.env.MERIT_API_KEY,
                'X-Project-ID': CONFIG.project_id
            }
        });

        const data = await response.json();
        
        console.log(`\n✅ Response Status: ${response.status}`);
        console.log('Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 403) {
            if (data.message === 'Missing Authentication Token') {
                console.log('\n🔴 Test failed - API key not recognized');
            } else {
                console.log('\n🟡 Test complete - authentication required but token format correct');
            }
        } else if (response.status === 401) {
            console.log('\n🔴 Test failed - invalid API key');
        } else if (response.status === 200) {
            console.log('\n🟢 Test complete - successfully authenticated');
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