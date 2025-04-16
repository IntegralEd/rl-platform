/**
 * Merit Assistant Health Check
 * Direct connection test without auth requirements
 */

const ASSISTANT_CONFIG = {
    id: 'asst_QoAA395ibbyMImFJERbG2hKT',
    project: 'proj_V4lrL1OSfydWCFW0zjgwrFRT'
};

const ENDPOINTS = {
    base: 'https://api.recursivelearning.app'
};

async function checkAssistantHealth() {
    console.log('🔍 Checking Merit Assistant direct connection...');
    console.log(`Assistant ID: ${ASSISTANT_CONFIG.id}`);
    console.log(`Project ID: ${ASSISTANT_CONFIG.project}`);
    console.log(`API Endpoint: ${ENDPOINTS.base}`);

    try {
        // Simple ping test first
        const pingResponse = await fetch(`${ENDPOINTS.base}/ping`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!pingResponse.ok) {
            throw new Error(`API not reachable: ${pingResponse.status}`);
        }

        // Then check assistant availability
        const response = await fetch(`${ENDPOINTS.base}/v1/assistants/${ASSISTANT_CONFIG.id}/check`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Project-ID': ASSISTANT_CONFIG.project
            }
        });

        if (!response.ok) {
            throw new Error(`Assistant check failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('\n✅ Connection Check Results:');
        console.log('------------------------');
        console.log('API Reachable:', data.api_status || 'yes');
        console.log('Assistant Found:', data.assistant_found || 'yes');
        console.log('Project Valid:', data.project_valid || 'yes');

        return {
            status: 'healthy',
            ...data
        };
    } catch (error) {
        console.error('\n❌ Connection Check Failed:');
        console.error('------------------------');
        console.error('Error:', error.message);
        console.error('Details:', {
            endpoint: ENDPOINTS.base,
            assistant: ASSISTANT_CONFIG.id,
            project: ASSISTANT_CONFIG.project
        });
        throw error;
    }
}

// Run connection check
checkAssistantHealth()
    .then(result => {
        if (result.status === 'healthy') {
            console.log('\n🟢 Merit Assistant is reachable!');
            process.exit(0);
        } else {
            console.log('\n🟡 Connection issues detected:', result.message);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('\n🔴 Connection failed:', error.message);
        process.exit(1);
    }); 