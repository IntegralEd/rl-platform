/**
 * Merit Assistant Health Check
 * Validates connection to OpenAI assistant and Lambda endpoint
 */

const ASSISTANT_CONFIG = {
    id: 'asst_QoAA395ibbyMImFJERbG2hKT',
    project: 'proj_V4lrL1OSfydWCFW0zjgwrFRT'
};

const ENDPOINTS = {
    lambda: process.env.LAMBDA_ENDPOINT || 'https://api.recursivelearning.app'
};

async function checkAssistantHealth() {
    console.log('🔍 Checking Merit Assistant health...');
    console.log(`Assistant ID: ${ASSISTANT_CONFIG.id}`);
    console.log(`Project ID: ${ASSISTANT_CONFIG.project}`);
    console.log(`Lambda Endpoint: ${ENDPOINTS.lambda}`);

    try {
        const response = await fetch(`${ENDPOINTS.lambda}/health`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Project-ID': ASSISTANT_CONFIG.project,
                'X-Assistant-ID': ASSISTANT_CONFIG.id
            },
            body: JSON.stringify({
                action: 'health_check',
                assistant_id: ASSISTANT_CONFIG.id
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('\n✅ Health Check Results:');
        console.log('------------------------');
        console.log('Lambda Status:', data.status);
        console.log('Assistant Available:', data.assistant_available);
        console.log('Project Paired:', data.project_paired);
        console.log('Response Time:', data.response_time_ms + 'ms');

        return data;
    } catch (error) {
        console.error('\n❌ Health Check Failed:');
        console.error('------------------------');
        console.error('Error:', error.message);
        console.error('Details:', {
            endpoint: ENDPOINTS.lambda,
            assistant: ASSISTANT_CONFIG.id,
            project: ASSISTANT_CONFIG.project
        });
        throw error;
    }
}

// Run health check
checkAssistantHealth()
    .then(result => {
        if (result.status === 'healthy') {
            console.log('\n🟢 Merit Assistant is ready!');
            process.exit(0);
        } else {
            console.log('\n🟡 Merit Assistant needs attention:', result.message);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('\n🔴 Merit Assistant is unavailable:', error.message);
        process.exit(1);
    }); 