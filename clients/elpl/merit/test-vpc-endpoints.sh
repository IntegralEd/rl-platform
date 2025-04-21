#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 Testing Merit API Gateway VPC Integration"
echo "============================================"

# Test VPC Access
echo -e "\n📡 Testing VPC Access..."
VPC_ID="vpc-07e76ce384fa696e0"
aws ec2 describe-vpcs --vpc-ids $VPC_ID > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ VPC Access Confirmed${NC}"
else
    echo -e "${RED}✗ VPC Access Failed${NC}"
    exit 1
fi

# Test Subnets
echo -e "\n🌐 Testing Subnet Access..."
SUBNETS=(
    "subnet-020aac4490f925b34"
    "subnet-05d321f42e41149d3"
    "subnet-0588b74fc8b1585f9"
)

for SUBNET in "${SUBNETS[@]}"; do
    aws ec2 describe-subnets --subnet-ids $SUBNET > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Subnet $SUBNET Available${NC}"
    else
        echo -e "${RED}✗ Subnet $SUBNET Not Available${NC}"
        exit 1
    fi
done

# Test API Gateway Endpoint
echo -e "\n🚀 Testing API Gateway Endpoint..."
ENDPOINT="https://api.recursivelearning.app/prod/api/v1/mock"
API_KEY="qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J"

curl -s -o /dev/null -w "%{http_code}" \
    -H "x-api-key: $API_KEY" \
    $ENDPOINT

if [ $? -eq 200 ]; then
    echo -e "${GREEN}✓ API Gateway Endpoint Responding${NC}"
else
    echo -e "${RED}✗ API Gateway Endpoint Failed${NC}"
    exit 1
fi

# Test Lambda Integration
echo -e "\n⚡ Testing Lambda Integration..."
aws lambda list-functions --query "Functions[?contains(FunctionName, 'rl-context-prod')]" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Lambda Functions Available${NC}"
else
    echo -e "${RED}✗ Lambda Functions Not Found${NC}"
    exit 1
fi

echo -e "\n✅ All Tests Completed Successfully!"
echo "Integration Status: MVP Ready for Chat" 