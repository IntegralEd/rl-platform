/**
 * Merit Assistant Health Check
 * Lambda v1 endpoint availability test
 */

const ENDPOINTS = {
    lambda: 'https://api.recursivelearning.app/v1/lambda'
};

async function checkLambdaConnection() {
    console.log('🔍 Checking Lambda v1 endpoint availability...');
    console.log(`Lambda Endpoint: ${ENDPOINTS.lambda}`);

    try {
        // Lambda endpoint test
        const response = await fetch(`${ENDPOINTS.lambda}/ping`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('\n✅ Lambda Response Status:', response.status);
        
        const text = await response.text();
        console.log('Response Body:', text || 'Empty response');

        return {
            status: response.status,
            body: text
        };
    } catch (error) {
        console.error('\n❌ Lambda Connection Failed:');
        console.error('------------------------');
        console.error('Error:', error.message);
        console.error('Details:', {
            endpoint: ENDPOINTS.lambda
        });
        throw error;
    }
}

// Run lambda connection check
checkLambdaConnection()
    .then(result => {
        console.log('\n🟢 Lambda connection test complete');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n🔴 Lambda connection failed:', error.message);
        process.exit(1);
    }); 