const Redis = require('ioredis');

// Redis Configuration
const REDIS_CONFIG = {
    endpoint: process.env.REDIS_ENDPOINT || 'redis://redis.recursivelearning.app:6379',
    user: 'recursive-frontend', // Read-only access for frontend
    password: process.env.REDIS_PASSWORD,
    defaultTTL: 3600,
    retryAttempts: 3,
    connectTimeout: 5000,
    maxRetriesPerRequest: 1
};

async function testRedisConnection() {
    const redis = new Redis({
        host: REDIS_CONFIG.endpoint.split('://')[1].split(':')[0],
        port: 6379,
        username: REDIS_CONFIG.user,
        password: REDIS_CONFIG.password,
        retryStrategy: (times) => {
            if (times <= REDIS_CONFIG.retryAttempts) {
                return Math.min(times * 100, 3000);
            }
            return null;
        }
    });

    try {
        // Test basic connectivity
        console.log('Testing Redis connection...');
        const pingResult = await redis.ping();
        console.log('PING response:', pingResult);

        // Test context access (read-only)
        console.log('\nTesting context access...');
        const testContextKey = 'context:elpl:merit:test';
        const contextValue = await redis.get(testContextKey);
        console.log('Context read test:', contextValue === null ? 'Success (key not found)' : 'Success (key found)');

        // Test schema access (read-only)
        console.log('\nTesting schema access...');
        const testSchemaKey = 'schema:merit:test';
        const schemaValue = await redis.get(testSchemaKey);
        console.log('Schema read test:', schemaValue === null ? 'Success (key not found)' : 'Success (key found)');

        // Verify we cannot write (should fail due to read-only access)
        console.log('\nVerifying read-only access...');
        try {
            await redis.set(testContextKey, 'test');
            console.log('WARNING: Write succeeded when it should have failed');
        } catch (writeError) {
            console.log('Write permission test: Success (write correctly denied)');
        }

        console.log('\nAll Redis tests completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\nRedis test failed:', error.message);
        if (error.message.includes('WRONGPASS')) {
            console.error('Authentication failed - check REDIS_PASSWORD environment variable');
        } else if (error.message.includes('NOPERM')) {
            console.error('Permission denied - verify user access rights');
        } else if (error.message.includes('NOAUTH')) {
            console.error('Authentication required - ensure REDIS_PASSWORD is set');
        } else if (error.message.includes('connect ECONNREFUSED')) {
            console.error('Connection refused - verify REDIS_ENDPOINT and network connectivity');
        } else if (error.message.includes('getaddrinfo')) {
            console.error('DNS resolution failed - check endpoint hostname');
        }
        process.exit(1);
    } finally {
        redis.quit();
    }
}

testRedisConnection(); 