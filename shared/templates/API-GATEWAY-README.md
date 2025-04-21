# API Gateway Configuration Guide - Merit Integration

## Current Status (Updated May 19, 2025)

**🔄 IMPLEMENTATION IN PROGRESS**: Private API Gateway Migration
* Converting to Private API Gateway with VPC endpoint access
* CORS configuration maintained from previous implementation
* VPC Link integration for Lambda functions

**🚨 CRITICAL BLOCKERS**
1. VPC Link Creation Failed
   - Error: "Vpc link VpcLink was not found in account 559050208320"
   - Blocker: Cannot deploy API Gateway without valid VPC Link
   - Impact: Blocks all private API Gateway functionality

## Architecture Overview

### Private API Gateway Configuration
- **API ID**: `l6lzwy3eie`
- **Endpoint**: `https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod`
- **VPC Endpoint ID**: `vpce-07e76ce384fa696e0`
- **VPC ID**: `vpc-07e76ce384fa696e0`

### VPC Configuration
- **CIDR**: `172.31.0.0/16`
- **Subnets**:
  - us-east-2a: `subnet-020aac4490f925b34`
  - us-east-2b: `subnet-05d321f42e41149d3`
  - us-east-2c: `subnet-0588b74fc8b1585f9`
- **Route Table**: `rtb-05532b9c7d15f5b8f`
- **DNS Hostnames**: Enabled
- **Block Public Access**: Off (Required for private API)

### Load Balancer Configuration
- **Target Load Balancers**:
  ```
  arn:aws:elasticloadbalancing:us-east-2:718770453195:loadbalancer/app/prod-cmh-1-cdtls-1-2-100/1120e7fa7fe27cd1
  arn:aws:elasticloadbalancing:us-east-2:718770453195:loadbalancer/app/prod-cmh-1-cdtls-1-2-133/bcb4d9ef523a5fed
  arn:aws:elasticloadbalancing:us-east-2:718770453195:loadbalancer/app/prod-cmh-1-cdtls-1-2-252/cdaafda30bb06c0f
  ```

## Implementation Files

- [`client-merit-gateway-cors.yaml`](./client-merit-gateway-cors.yaml) - Primary production configuration
- [`client-merit-gateway-cors-beautiful.yaml`](./client-merit-gateway-cors-beautiful.yaml) - Testing/staging configuration (DO NOT DEPLOY)
- [`client-merit-gateway-monitoring.yaml`](./client-merit-gateway-monitoring.yaml) - CloudWatch monitoring setup

## API Gateway Endpoints

### Root Endpoint (/)
- **Methods**: POST, OPTIONS
- **Integration**: HTTP_PROXY via VPC Link
- **Purpose**: Thread creation and message sending

### Cache Operations (/cache/{action})
- **Methods**: GET, POST, OPTIONS
- **Integration**: HTTP_PROXY via VPC Link
- **Actions**: get, set
- **Purpose**: Redis cache operations

### Health Check (/cache/health)
- **Methods**: GET, OPTIONS
- **Integration**: HTTP_PROXY via VPC Link
- **Purpose**: Redis connection health verification

## CORS Configuration

All endpoints include the following CORS headers:
```
Access-Control-Allow-Origin: 'https://recursivelearning.app'
Access-Control-Allow-Methods: 'GET,POST,PUT,DELETE,OPTIONS'
Access-Control-Allow-Headers: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
Access-Control-Allow-Credentials: 'true'
```

## Security Configuration

### API Key Authentication
- **Production Key**: `68gmsx2jsk`
- **Mock Gateway Key**: `O3ySlJaYiF6cJQQCEcJIvaH027G9VxLa22gi5Qki`

### VPC Security
- Private API Gateway accessible only through VPC endpoint
- VPC Link for secure Lambda integration
- No direct public internet access required

## Environment Variables

```bash
# API Gateway Configuration
LAMBDA_ENDPOINT=https://api.recursivelearning.app/prod/api/v1
API_GATEWAY_ENDPOINT=https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod
API_GATEWAY_KEY=68gmsx2jsk
MERIT_API_KEY=qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J
```

## Implementation Steps

1. **VPC Endpoint Setup**:
   - Create VPC endpoint for API Gateway
   - Associate with all three availability zone subnets
   - Configure security groups and route tables

2. **Private API Configuration**:
   - Import OpenAPI definition
   - Configure VPC endpoint association
   - Set up VPC Link for Lambda integration

3. **Integration Testing**:
   - Verify VPC endpoint connectivity
   - Test CORS preflight requests
   - Validate Lambda function integration
   - Check Redis cache operations

4. **Monitoring Setup**:
   - Configure CloudWatch metrics
   - Set up VPC Flow Logs
   - Enable API Gateway access logging

## Troubleshooting Guide

### Common Issues and Solutions

1. **VPC Link Connection Errors**:
   - Verify VPC Link ID in API Gateway configuration
   - Check Load Balancer health status
   - Validate security group rules

2. **CORS Errors**:
   - Confirm OPTIONS method implementation
   - Check CORS headers in responses
   - Verify allowed origin configuration

3. **Lambda Integration Issues**:
   - Validate VPC Link configuration
   - Check Lambda function permissions
   - Verify HTTP_PROXY integration settings

## Monitoring and Alerts

- CloudWatch dashboard for API metrics
- VPC Flow Logs for network traffic analysis
- Lambda function execution logs
- Load Balancer health checks

## Next Steps (Priority Order)

1. **VPC Link Resolution** (CRITICAL)
   - [ ] Verify Load Balancer exists in account 559050208320
   - [ ] Create VPC Link manually in AWS Console
   - [ ] Document VPC Link ID once created
   - [ ] Update YAML configurations with actual VPC Link ID

2. **API Gateway Deployment** (BLOCKED)
   - [ ] Update client-merit-gateway-cors-beautiful.yaml with VPC Link ID
   - [ ] Test configuration in staging
   - [ ] Deploy to production if successful
   - [ ] Verify CORS headers

3. **Integration Testing** (PENDING)
   - [ ] Test context endpoint through VPC Link
   - [ ] Verify CORS preflight requests
   - [ ] Validate error responses
   - [ ] Check monitoring metrics

## Resources

- [AWS Private API Gateway Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-private-apis.html)
- [VPC Link Integration Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vpc-links.html)
- [CORS Configuration Reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)

## Development Workflow

1. Make configuration changes in `client-merit-gateway-cors-beautiful.yaml`
2. Test changes thoroughly in staging environment
3. After verification, migrate changes to `client-merit-gateway-cors.yaml`
4. Deploy production configuration
5. Maintain dated snapshots for rollback capability 