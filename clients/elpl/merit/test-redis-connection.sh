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

# Function to check DNS resolution
check_dns() {
    echo "Testing DNS resolution for redis.recursivelearning.app..."
    if host redis.recursivelearning.app > /dev/null 2>&1; then
        echo -e "${GREEN}✓ DNS resolution successful${NC}"
        return 0
    else
        echo -e "${RED}✗ DNS resolution failed${NC}"
        echo "Running dig for more information:"
        dig redis.recursivelearning.app
        return 1
    fi
}

# Function to test network connectivity
test_network() {
    echo "Testing network connectivity to Redis endpoint..."
    if nc -zv redis.recursivelearning.app 6379 2>/dev/null; then
        echo -e "${GREEN}✓ Port 6379 is reachable${NC}"
        return 0
    else
        echo -e "${RED}✗ Cannot connect to port 6379${NC}"
        echo "Checking if port is blocked:"
        sudo lsof -i :6379
        return 1
    fi
}

# Function to test Redis authentication
test_redis_auth() {
    echo "Testing Redis authentication..."
    if [ -z "$REDIS_PASSWORD" ]; then
        echo -e "${RED}✗ REDIS_PASSWORD not set${NC}"
        return 1
    fi
    
    if redis-cli -u "redis://recursive-frontend:${REDIS_PASSWORD}@redis.recursivelearning.app:6379" ping 2>/dev/null | grep -q 'PONG'; then
        echo -e "${GREEN}✓ Redis authentication successful${NC}"
        return 0
    else
        echo -e "${RED}✗ Redis authentication failed${NC}"
        return 1
    fi
}

# Function to test Redis permissions
test_redis_permissions() {
    echo "Testing Redis permissions..."
    
    # Test read access to context keys
    if redis-cli -u "redis://recursive-frontend:${REDIS_PASSWORD}@redis.recursivelearning.app:6379" get "context:test" 2>/dev/null; then
        echo -e "${GREEN}✓ Read permission verified${NC}"
        return 0
    else
        echo -e "${RED}✗ Read permission denied${NC}"
        echo "Note: recursive-frontend should have read-only access to context:*"
        return 1
    fi
}

# Main test sequence
echo "=== Redis Connection Test Suite ==="
echo "Starting tests at $(date)"
echo

# Run tests in sequence
check_dns
DNS_STATUS=$?

if [ $DNS_STATUS -eq 0 ]; then
    test_network
    NETWORK_STATUS=$?
    
    if [ $NETWORK_STATUS -eq 0 ]; then
        test_redis_auth
        AUTH_STATUS=$?
        
        if [ $AUTH_STATUS -eq 0 ]; then
            test_redis_permissions
            PERM_STATUS=$?
        fi
    fi
fi

# Summary
echo
echo "=== Test Summary ==="
echo "DNS Resolution: $([ $DNS_STATUS -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"
echo "Network Connectivity: $([ $NETWORK_STATUS -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"
echo "Redis Authentication: $([ $AUTH_STATUS -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"
echo "Redis Permissions: $([ $PERM_STATUS -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"

# Exit with overall status
if [ $DNS_STATUS -eq 0 ] && [ $NETWORK_STATUS -eq 0 ] && [ $AUTH_STATUS -eq 0 ] && [ $PERM_STATUS -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed successfully!${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Please check the output above for details.${NC}"
    exit 1
fi 