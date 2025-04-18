#!/bin/bash

# Load environment variables
source .env

# Function to test API endpoint
test_api() {
    echo "Testing API endpoint..."
    curl -s -o /dev/null -w "%{http_code}" \
        -H "Content-Type: application/json" \
        -H "x-api-key: $MERIT_API_KEY" \
        -H "X-Project-ID: $OPENAI_PROJECT_ID" \
        "$LAMBDA_ENDPOINT/chat"
}

# Function to test Redis connection
test_redis() {
    echo "Testing Redis connection..."
    redis-cli -u "$REDIS_URL" ping
}

# Print environment status
echo "Environment Configuration Test"
echo "----------------------------"
echo "LAMBDA_ENDPOINT: ${LAMBDA_ENDPOINT:-Not Set}"
echo "REDIS_URL: ${REDIS_URL:-Not Set}"
echo "MERIT_ASSISTANT_ID: ${MERIT_ASSISTANT_ID:-Not Set}"
echo "OPENAI_PROJECT_ID: ${OPENAI_PROJECT_ID:-Not Set}"
echo "ORG_ID: ${ORG_ID:-Not Set}"
echo "SCHEMA_VERSION: ${SCHEMA_VERSION:-Not Set}"
echo

# Test API connection
echo "API Connection Test"
echo "-----------------"
API_STATUS=$(test_api)
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API connection successful"
else
    echo "❌ API connection failed with status: $API_STATUS"
fi
echo

# Test Redis connection
echo "Redis Connection Test"
echo "-------------------"
if test_redis | grep -q "PONG"; then
    echo "✅ Redis connection successful"
else
    echo "❌ Redis connection failed"
fi 