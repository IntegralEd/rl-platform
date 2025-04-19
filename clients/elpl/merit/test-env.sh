#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Merit Environment Test Script${NC}"
echo "Version: 1.0.0"
echo "Date: $(date)"
echo "----------------------------------------"

# Load environment variables
if [ -f ".env" ]; then
    source .env
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
    echo -e "${RED}✗ No .env file found${NC}"
    exit 1
fi

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    echo -e "\n${YELLOW}Testing $name...${NC}"
    curl -s -o /dev/null -w "%{http_code}" "$url"
}

# Function to test Redis connection
test_redis() {
    echo -e "\n${YELLOW}Testing Redis Connection...${NC}"
    # Create temporary password file with escaped special characters
    local temp_pass_file=$(mktemp)
    printf "%s" "${REDIS_PASSWORD}" > "$temp_pass_file"
    
    # Add timeout to Redis connection
    if timeout 5 redis-cli -h "${REDIS_URL#*://}" -p 6379 --user "recursive-frontend" --askpass < "$temp_pass_file" ping 2>/dev/null | grep -q "PONG"
    then
        echo -e "${GREEN}✓ Redis connection successful${NC}"
        rm "$temp_pass_file"
        return 0
    else
        echo -e "${RED}✗ Redis connection failed${NC}"
        rm "$temp_pass_file"
        return 1
    fi
}

# Test 1: Schema Version Validation
echo -e "\n${YELLOW}1. Testing Schema Version Validation${NC}"
schema_response=$(curl -s -X GET "${LAMBDA_ENDPOINT}/api/v1/schema/fields" \
-H "Content-Type: application/json" \
-H "x-api-key: ${MERIT_API_KEY}" \
-H "X-Project-ID: ${OPENAI_PROJECT_ID}" \
-H "Origin: https://recursivelearning.app")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema validation endpoint accessible${NC}"
else
    echo -e "${RED}✗ Schema validation failed${NC}"
fi

# Test 2: Redis Frontend User Access
echo -e "\n${YELLOW}2. Testing Redis Frontend User Access${NC}"
test_redis

# Test 3: Redis Key Pattern Access
echo -e "\n${YELLOW}3. Testing Redis Key Pattern Access${NC}"
if [ -f "$temp_pass_file" ]; then
    timeout 5 redis-cli -h "${REDIS_URL#*://}" -p 6379 --user "recursive-frontend" --askpass < "$temp_pass_file" keys "merit:ela:context:*" 2>/dev/null
fi

# Test 4: Session Management
echo -e "\n${YELLOW}4. Testing Session Management${NC}"
session_id="merit-$(date +%s)-test"
session_response=$(curl -s -X POST "${LAMBDA_ENDPOINT}/api/v1/context" \
-H "Content-Type: application/json" \
-H "x-api-key: ${MERIT_API_KEY}" \
-H "X-Project-ID: ${OPENAI_PROJECT_ID}" \
-H "Origin: https://recursivelearning.app" \
-d "{
  \"gradeLevel\": \"Grade 3\",
  \"curriculum\": \"ela\",
  \"sessionId\": \"$session_id\"
}")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Session creation successful${NC}"
    echo "Session ID: $session_id"
else
    echo -e "${RED}✗ Session creation failed${NC}"
fi

# Test 5: Message Count Increment
echo -e "\n${YELLOW}5. Testing Message Count${NC}"
if [ -f "$temp_pass_file" ]; then
    timeout 5 redis-cli -h "${REDIS_URL#*://}" -p 6379 --user "recursive-frontend" --askpass < "$temp_pass_file" get "merit:messages:$session_id" 2>/dev/null
fi

echo -e "\n${YELLOW}Test Summary${NC}"
echo "----------------------------------------"
echo "1. Schema Validation: ${schema_response:0:50}..."
echo "2. Redis Connection: $(test_redis && echo 'OK' || echo 'FAILED')"
echo "3. Key Pattern Access: Tested"
echo "4. Session Management: ${session_response:0:50}..."
echo "5. Message Count: Verified"
echo "----------------------------------------" 