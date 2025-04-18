#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo -e "${YELLOW}Warning: .env file not found${NC}"
fi

# Function to test API Gateway configuration
test_api_config() {
    echo "Testing API Gateway configuration..."
    
    # Test OPTIONS request for CORS
    echo "Testing CORS configuration..."
    CORS_RESPONSE=$(curl -X OPTIONS -i \
        -H "Origin: https://recursivelearning.app" \
        -H "Access-Control-Request-Method: POST" \
        https://api.recursivelearning.app/api/v1/context 2>/dev/null)
    
    if echo "$CORS_RESPONSE" | grep -q "access-control-allow-origin"; then
        echo -e "${GREEN}✓ CORS headers present${NC}"
    else
        echo -e "${RED}✗ CORS headers missing${NC}"
        echo "Response headers:"
        echo "$CORS_RESPONSE" | grep -i "access-control"
    fi
}

# Function to test authentication methods
test_auth_methods() {
    echo "Testing authentication methods..."
    
    # Test with API Key
    echo "Testing API Key authentication..."
    API_RESPONSE=$(curl -s -w "\n%{http_code}" \
        -H "Content-Type: application/json" \
        -H "x-api-key: ${MERIT_API_KEY}" \
        -H "X-Project-ID: ${OPENAI_PROJECT_ID}" \
        https://api.recursivelearning.app/api/v1/mock)
    
    HTTP_CODE=$(echo "$API_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$API_RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ API Key authentication successful${NC}"
    else
        echo -e "${RED}✗ API Key authentication failed (HTTP $HTTP_CODE)${NC}"
        echo "Response: $RESPONSE_BODY"
    fi
}

# Function to test context endpoint
test_context_endpoint() {
    echo "Testing context endpoint..."
    
    # Test data
    TEST_DATA='{
        "gradeLevel": "Grade 3",
        "curriculum": "ela",
        "schema_version": "'"${SCHEMA_VERSION}"'"
    }'
    
    # Make the request
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "x-api-key: ${MERIT_API_KEY}" \
        -H "X-Project-ID: ${OPENAI_PROJECT_ID}" \
        -d "$TEST_DATA" \
        https://api.recursivelearning.app/api/v1/context)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "HTTP Status: $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
    
    # Check response
    case $HTTP_CODE in
        200)
            echo -e "${GREEN}✓ Context endpoint test successful${NC}"
            ;;
        403)
            echo -e "${RED}✗ Context endpoint forbidden${NC}"
            echo "Possible issues:"
            echo "1. API Gateway method not enabled for POST"
            echo "2. Missing or invalid API key"
            echo "3. IAM permissions not configured"
            echo "4. CORS not configured for POST"
            ;;
        404)
            echo -e "${RED}✗ Context endpoint not found${NC}"
            echo "Verify endpoint path and API Gateway configuration"
            ;;
        *)
            echo -e "${RED}✗ Unexpected status code: $HTTP_CODE${NC}"
            ;;
    esac
}

# Function to verify API Gateway logs
check_cloudwatch_logs() {
    echo "Checking CloudWatch logs..."
    if [ -z "$AWS_PROFILE" ]; then
        echo -e "${YELLOW}Warning: AWS_PROFILE not set, skipping CloudWatch check${NC}"
        return
    fi
    
    # Get recent logs
    aws logs get-log-events \
        --log-group-name "/aws/apigateway/29wtfiieig" \
        --log-stream-name "$(date +%Y/%m/%d)" \
        --limit 5
}

# Main test sequence
echo "=== API Context Endpoint Test Suite ==="
echo "Starting tests at $(date)"
echo

# Run tests
test_api_config
test_auth_methods
test_context_endpoint
check_cloudwatch_logs

# Print environment info
echo
echo "=== Environment Information ==="
echo "API Gateway ID: 29wtfiieig"
echo "Stage: dev"
echo "Endpoint: api.recursivelearning.app"
echo "Schema Version: ${SCHEMA_VERSION:-Not Set}"

# Recommendations based on test results
echo
echo "=== Recommendations ==="
echo "1. Verify API Gateway configuration in AWS Console"
echo "2. Check Lambda function permissions"
echo "3. Verify CORS configuration for POST method"
echo "4. Review CloudWatch logs for detailed error messages"
echo "5. Test with AWS CLI to bypass potential client issues" 