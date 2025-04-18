#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Merit Environment Test Script"
echo "============================"

# Required variables - using exact header format
MERIT_API_KEY="qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J"
OPENAI_PROJECT_ID="proj_V4lrL1OSfydWCFW0zjgwrFRT"
MERIT_ASSISTANT_ID="asst_QoAA395ibbyMImFJERbG2hKT"
MERIT_ORG_ID="recdg5Hlm3VVaBA2u"
REDIS_PASSWORD="Zo5ZaOWpucHRrH2FEwWbibqxalwLVIEZ"

# Check each required variable
for VAR in "MERIT_API_KEY" "OPENAI_PROJECT_ID" "MERIT_ASSISTANT_ID" "MERIT_ORG_ID" "REDIS_PASSWORD"; do
    if [ -n "${!VAR}" ]; then
        echo -e "${GREEN}✓ $VAR is set${NC}"
    else
        echo -e "${RED}✗ $VAR is not set${NC}"
        exit 1
    fi
done

echo -e "\nTesting API Connectivity..."
echo "-----------------------------"

# Test API endpoint with exact header format
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "x-api-key: ${MERIT_API_KEY}" \
    -H "X-Project-ID: ${OPENAI_PROJECT_ID}" \
    -d "{
        \"action\": \"create_thread\",
        \"org_id\": \"${MERIT_ORG_ID}\",
        \"assistant_id\": \"${MERIT_ASSISTANT_ID}\",
        \"schema_version\": \"1.0.16\",
        \"project_id\": \"${OPENAI_PROJECT_ID}\"
    }" \
    "https://api.recursivelearning.app/prod/api/v1/mock")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ API endpoint test successful${NC}"
    echo "Response: $RESPONSE_BODY"
else
    echo -e "${RED}❌ API endpoint test failed with status $HTTP_CODE${NC}"
    echo "Response: $RESPONSE_BODY"
    echo -e "\nDebug Information:"
    echo "API Key: ${MERIT_API_KEY}"
    echo "Project ID: ${OPENAI_PROJECT_ID}"
    echo "Endpoint: https://api.recursivelearning.app/prod/api/v1/mock"
fi

echo -e "\nRedis Connection Test..."
echo "-------------------------"
echo -e "${YELLOW}⚠️ Redis connection test not yet implemented${NC}"

exit 0 