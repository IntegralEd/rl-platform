const redis = require('redis');

// Redis Configuration
const REDIS_ENDPOINT = 'redis://redis.recursivelearning.app:6379';
const REDIS_USER_TYPE = 'recursive-backend';

// Create a Redis client
const client = redis.createClient({
  url: REDIS_ENDPOINT,
  username: REDIS_USER_TYPE,
  // Add password or other configurations if needed
});

client.on('error', (err) => {
  console.error('Redis connection error:', err);
});

client.on('connect', () => {
  console.log('Connected to Redis as', REDIS_USER_TYPE);
});

// Function to store timesheet data
function storeTimesheetData(orgId, threadId, fieldAtId, data) {
  const key = `context:${orgId}:${threadId}:${fieldAtId}`;
  const filteredData = data.filter(entry => entry.billingCode && entry.notes && entry.minutes);
  client.set(key, JSON.stringify(filteredData), 'EX', 3600, (err) => {
    if (err) {
      console.error('Failed to store timesheet data:', err);
    } else {
      console.log('Timesheet data stored successfully');
    }
  });
}

module.exports = {
  storeTimesheetData,
};
