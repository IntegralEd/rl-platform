// Assistant Configuration
// Last Updated: April 21, 2024
// Version: 1.0.16

export const AssistantConfig = {
  // Core Configuration
  version: '1.0.16',
  buildDate: '04212024',
  environment: 'production',
  
  // Assistant Details
  assistant: {
    id: 'asst_QoAA395ibbyMImFJERbG2hKT',
    name: 'Merit ELA Assistant',
    description: 'EL Education Language Arts Curriculum Support Assistant',
    model: 'gpt-4-turbo-preview',
    capabilities: ['curriculum-support', 'lesson-planning', 'differentiation']
  },
  
  // API Configuration
  api: {
    endpoint: 'https://api.recursivelearning.app/prod',
    version: 'v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 2000
  },
  
  // UI Configuration
  ui: {
    theme: {
      primary: '#c6123f',
      secondary: '#211651',
      background: '#ffffff',
      text: '#2c3e50'
    },
    loading: {
      initialDelay: 300,
      spinnerTimeout: 2000,
      messageDelay: 500
    },
    chat: {
      maxLength: 1000,
      typingDelay: 50,
      messageSpacing: 16
    }
  },
  
  // Validation Rules
  validation: {
    gradeLevel: {
      required: true,
      options: ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']
    },
    curriculum: {
      required: true,
      default: 'ela'
    }
  },
  
  // Error Messages
  errors: {
    connection: 'Unable to connect to the assistant. Please try again.',
    validation: 'Please complete all required fields.',
    timeout: 'Request timed out. Please try again.',
    api: 'An error occurred while processing your request.'
  },
  
  // Loading Messages
  loadingMessages: [
    'Connecting to your assistant...',
    'Loading curriculum resources...',
    'Preparing your personalized experience...'
  ]
};

// Validation Functions
export const validateConfig = () => {
  console.log('[Merit Config] Validating assistant configuration...');
  
  // Validate required fields
  const requiredFields = ['version', 'assistant.id', 'api.endpoint'];
  const missingFields = requiredFields.filter(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], AssistantConfig);
    return !value;
  });
  
  if (missingFields.length > 0) {
    console.error('[Merit Config] Missing required fields:', missingFields);
    return false;
  }
  
  // Validate API endpoint
  if (!AssistantConfig.api.endpoint.startsWith('https://')) {
    console.error('[Merit Config] Invalid API endpoint:', AssistantConfig.api.endpoint);
    return false;
  }
  
  console.log('[Merit Config] Configuration validated successfully');
  return true;
};

// Initialize Configuration
export const initializeConfig = () => {
  if (!validateConfig()) {
    throw new Error('Invalid assistant configuration');
  }
  
  // Log initialization
  console.log('[Merit Config] Initializing with version:', AssistantConfig.version);
  console.log('[Merit Config] Build date:', AssistantConfig.buildDate);
  console.log('[Merit Config] Environment:', AssistantConfig.environment);
  
  return AssistantConfig;
};

// Export default configuration
export default AssistantConfig;

// Merit Environment Configuration
// Last Updated: April 21, 2024
// Version: 1.0.16

// Initialize window.env if it doesn't exist
window.env = window.env || {};

// API Gateway Configuration
window.env.RL_API_GATEWAY_ENDPOINT = 'https://api.recursivelearning.app/prod';
window.env.RL_API_KEY = 'qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J';
window.env.RL_SCHEMA_VERSION = '04102025.B01';

// Merit-specific configuration
window.env.MERIT_ASSISTANT_ID = 'asst_QoAA395ibbyMImFJERbG2hKT';
window.env.MERIT_ORG_ID = 'recdg5Hlm3VVaBA2u';
window.env.OPENAI_PROJECT_ID = 'proj_V4lrL1OSfydWCFW0zjgwrFRT';

// API Configuration
window.env.API_GATEWAY_ENDPOINT = 'https://api.recursivelearning.app/prod';
window.env.API_GATEWAY_KEY = 'qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J';
window.env.LAMBDA_ENDPOINT = 'https://api.recursivelearning.app/prod/api/v1';

// VPC Configuration
window.env.VPC_ID = 'vpc-07e76ce384fa696e0';
window.env.USAGE_PLAN_ID = 'r4plrt';

// Build Information
window.env.BUILD_VERSION = '1.16';
window.env.BUILD_DATE = '04212024.1800';
window.env.ENVIRONMENT = 'prod';

// Log configuration load
console.log('[Assistant Config] Environment loaded:', {
    apiGateway: window.env.RL_API_GATEWAY_ENDPOINT,
    schemaVersion: window.env.RL_SCHEMA_VERSION,
    timestamp: new Date().toISOString()
}); 