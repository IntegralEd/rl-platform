# Merit E2E Integration - Backend Tasks (April 22, 2025)

## 🎓 Infrastructure as Code (IAC) Lexicon

### Key Concepts
- **Infrastructure as Code (IAC)**: Managing infrastructure using code and version control instead of manual configuration
- **CloudFormation**: AWS's native IAC service for creating and managing AWS resources
- **Stack**: A collection of AWS resources that you can manage as a single unit
- **Template**: YAML/JSON file that declares the AWS resources you want to provision
- **Parameter**: Variable input that's provided when you create or update a stack
- **Mapping**: A lookup table in templates for region/environment specific values
- **!Ref**: References a parameter or resource defined in the template
- **!Sub**: Substitutes variables in a string with their values
- **!FindInMap**: Retrieves values from a mapping based on keys
- **!GetAtt**: Gets an attribute from a resource in the template
- **Drift**: When actual resource configuration differs from template

### Best Practices
- Always version control templates
- Use parameters for values that change between environments
- Use mappings for environment-specific constants
- Validate templates before deployment
- Plan for rollback scenarios
- Document dependencies and assumptions

### CloudFormation Reference Patterns
- **Direct References** (!Ref):
  ```yaml
  # Safe: References to resources in same template
  RestApiId: !Ref RLRestApi
  ResourceId: !Ref ApiResourceContext
  
  # Caution: Environment variables
  StageName: !Ref Environment  # Use EnvMap instead
  ```

- **String Substitution** (!Sub):
  ```yaml
  # Safe: AWS pseudo-parameters
  Resource: !Sub arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:*/*/*/*
  
  # Better: Use EnvMap for environment-specific values
  Uri: !Sub https://${EnvMap.${Environment}.ApiDomain}/${Environment}/api/v1/context
  ```

- **Map Lookups** (!FindInMap):
  ```yaml
  # Preferred: Environment-specific constants
  VpcId: !FindInMap [EnvMap, !Ref Environment, VpcId]
  SubnetIds: !FindInMap [EnvMap, !Ref Environment, SubnetIds]
  ```

### Required Stages
1. **Production** (prod)
   - Primary tenant endpoints
   - Strict rate limiting
   - Full monitoring
   - IAM auth for admin

2. **Development** (dev) - Optional
   - Testing new features
   - Relaxed rate limits
   - Separate Redis instance
   - Test API keys

### E2E Methods Required
```yaml
# Public Methods (API Key only)
- OPTIONS /api/v1/context
- POST /api/v1/context
- POST /api/v1/context/threads

# Admin Methods (IAM Auth + API Key)
- PUT /api/v1/context
- DELETE /api/v1/context
- POST /api/v1/admin

# Not Exposed (Internal Only)
- Redis operations
- Airtable sync
- Schema updates
```

## 🏗️ Infrastructure Consolidation

### 1. Repository Setup
- [ ] Create infrastructure directory structure
  ```
  infrastructure/
  ├── cloudformation/
  │   ├── templates/
  │   │   ├── rl-rest-api-gateway-stack.yaml
  │   │   ├── rl-rest-api-gateway-prod.yaml
  │   │   └── rl-rest-api-gateway-staging.yaml
  │   └── parameters/
  │       ├── prod.json.template
  │       └── staging.json.template
  ├── scripts/
  │   ├── validate-template.sh
  │   └── deploy-stack.sh
  └── secrets/ (git-ignored)
      ├── prod.json
      └── staging.json
  ```

### 2. Template Migration
- [ ] Copy working hardcoded values from current stack
  - VPC Link configuration
  - API Gateway endpoints
  - NLB settings
  - Lambda integrations
- [ ] Create parameterized version
  - Environment variables
  - Resource names
  - ARNs and IDs
- [ ] Validate template structure
  - Resource dependencies
  - Security policies
  - IAM roles

### 3. Parameter Management
- [ ] Set up SSM parameters in AWS
  ```
  /integraled/central/prod/
  ├── api_key
  ├── vpc_id
  ├── subnet_ids
  ├── certificate_arn
  └── nlb_arn
  ```
- [ ] Create parameter templates
  - Production values (sanitized)
  - Staging values (sanitized)
- [ ] Document all required parameters

### 4. Deployment Scripts
- [ ] Create validation script
  - Template structure check
  - Parameter validation
  - Security policy verification
- [ ] Create deployment script
  - Parameter resolution
  - Stack creation/update
  - Rollback handling

## 🔄 Migration Process

### 1. Staging Environment
- [ ] Deploy NLB stack
- [ ] Create VPC Link
- [ ] Deploy API Gateway
- [ ] Verify endpoints
- [ ] Test Lambda integration
- [ ] Validate Redis access

### 2. Production Environment
- [ ] Backup current configuration
- [ ] Export current state
- [ ] Deploy new stack
- [ ] Migrate traffic
- [ ] Verify functionality
- [ ] Update DNS

## 🔍 Validation Tests

### 1. Infrastructure Tests
```bash
# Validate stack
./scripts/validate-template.sh prod

# Check NLB health
aws elbv2 describe-target-health \
  --target-group-arn ${TARGET_GROUP_ARN}

# Test VPC Link
aws apigateway get-vpc-link \
  --vpc-link-id ${VPC_LINK_ID}
```

### 2. API Tests
```bash
# Test endpoints
curl -v -X OPTIONS "${BASE_URL}/api/v1/context" \
  -H "Origin: https://recursivelearning.app"

curl -v -X POST "${BASE_URL}/api/v1/context" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json"
```

### 3. Integration Tests
- [ ] Verify Lambda execution
- [ ] Check Redis connectivity
- [ ] Validate CORS headers
- [ ] Test error responses

## 📊 Monitoring Setup

### 1. CloudWatch Dashboards
- [ ] Create infrastructure dashboard
  - NLB metrics
  - VPC Link status
  - API Gateway metrics
  - Lambda performance
- [ ] Set up alerts
  - Error thresholds
  - Latency thresholds
  - Health checks

### 2. Logging
- [ ] Configure CloudWatch Logs
- [ ] Set up log retention
- [ ] Create log metrics
- [ ] Set up alerts

## 🔐 Security Review

### 1. IAM Policies
- [ ] Review role permissions
- [ ] Validate least privilege
- [ ] Check resource policies
- [ ] Audit access logs

### 2. Network Security
- [ ] Verify VPC endpoints
- [ ] Check security groups
- [ ] Validate NACLs
- [ ] Test connectivity

## 📝 Documentation

### 1. Architecture
- [ ] Update architecture diagram
- [ ] Document dependencies
- [ ] Create runbooks
- [ ] Write troubleshooting guide

### 2. Operations
- [ ] Document deployment process
- [ ] Create rollback procedures
- [ ] Write monitoring guide
- [ ] Update emergency procedures

## 👥 Team Communication
- [ ] Infrastructure review meeting
- [ ] Security review session
- [ ] Operations handoff
- [ ] Frontend team sync

## 🔄 Frontend Integration

### 1. Environment Configuration
```env
# Frontend Environment (.env)
VITE_API_ENDPOINT=https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod
VITE_API_KEY=merit-api-key-20240421
VITE_PROJECT_ID=recursivelearning
VITE_CORS_ORIGIN=https://recursivelearning.app

# Context Headers
VITE_HEADER_GRADE_LEVEL=X-Grade-Level
VITE_HEADER_CURRICULUM=X-Curriculum
VITE_HEADER_PROJECT_ID=X-Project-ID
VITE_HEADER_USER_ID=X-User-ID
VITE_HEADER_THREAD_ID=X-Thread-ID
VITE_HEADER_SOURCE_URL=X-Source-URL
VITE_HEADER_ENTRY_POINT=X-Entry-Point
```

### 2. Required Frontend Updates
- [ ] Update API client configuration
- [ ] Implement context header injection
- [ ] Add error handling for API responses
- [ ] Test CORS preflight requests
- [ ] Validate thread management
- [ ] Implement temporary user handling

## 🔄 Rollback Plan
1. **Pre-Deployment**
   - [x] Document current stack state
   - [x] Export environment variables
   - [x] Backup CloudFormation template
   - [x] Note all resource ARNs

2. **Stack Deletion**
   ```bash
   # Delete existing stack
   aws cloudformation delete-stack \
     --stack-name rl-rest-api-gateway-stack \
     --region us-east-2
   
   # Wait for deletion
   aws cloudformation wait stack-delete-complete \
     --stack-name rl-rest-api-gateway-stack \
     --region us-east-2
   ```

3. **New Deployment**
   - [ ] Validate consolidated template
   - [ ] Create new stack with proper environment
   - [ ] Verify all endpoints and integrations
   - [ ] Update frontend configuration
   - [ ] Test end-to-end flow

4. **Rollback Trigger Points**
   - VPC Link creation failure
   - NLB health check failure
   - API Gateway deployment issues
   - CORS validation errors
   - Frontend integration failures

5. **Emergency Contacts**
   - DevOps: David (Slack: @david)
   - Frontend: Cara (Slack: @cara)
   - Infrastructure: Merit Team (merit-infra@integral-ed.com) 