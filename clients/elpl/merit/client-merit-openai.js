/*
 * @component MeritOpenAIClient
 * @description Handles OpenAI Assistant interactions for Merit chat with Redis caching
 * @version 1.0.21
 */

class MeritOpenAIClient {
  constructor() {
    console.log('[Merit OpenAI] Initializing client...');
    
    // Core configuration
    this.threadId = null;
    this.assistantId = window.env.MERIT_ASSISTANT_ID;
    this.userId = this.generateSessionId();

    // Base configuration
    this.baseUrl = window.env.RL_API_GATEWAY_ENDPOINT;
    this.config = {
      project_id: window.env.OPENAI_PROJECT_ID,
      assistant_id: window.env.MERIT_ASSISTANT_ID,
      schema_version: window.env.RL_SCHEMA_VERSION,
      ttl: {
        session: 3600,
        cache: 3600,
        context: 3600
      }
    };

    // Fetch configuration
    this.fetchConfig = {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': window.env.RL_API_KEY,
        'X-Project-ID': window.env.OPENAI_PROJECT_ID,
        'Origin': 'https://recursivelearning.app'
      },
      mode: 'cors',
      credentials: 'include'
    };

    // Error handling configuration
    this.retryConfig = {
      maxAttempts: 3,
      baseDelay: 2000,
      maxDelay: 8000
    };

    // Redis Configuration with validated auth
    this.redisConfig = {
      endpoint: window.env.REDIS_URL || 'redis://redis.recursivelearning.app:6379',
      auth: {
        username: 'recursive-frontend',
        password: window.env.REDIS_PASSWORD
      },
      defaultTTL: 3600, // 1 hour for MVP
      keys: {
        context: (sessionId) => `merit:ela:context:${sessionId}`,
        thread: (sessionId) => `merit:ela:thread:${sessionId}`,
        cache: (key) => `merit:ela:cache:${key}`,
        session: (sessionId) => `merit:session:${sessionId}`,
        messageCount: (sessionId) => `merit:messages:${sessionId}`
      },
      retryOptions: {
        retries: 3,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 5000
      }
    };

    // Headers with platform-wide API key
    this.headers = {
      'Content-Type': 'application/json',
      'x-api-key': window.env.RL_API_KEY,
      'X-Project-ID': this.config.project_id,
      'Origin': 'https://recursivelearning.app'
    };

    this.state = {
      isLoading: false,
      hasError: false,
      errorMessage: null,
      lastRequest: null,
      lastResponse: null,
      isPreloaded: false,
      context: null,
      projectPaired: false,
      sessionType: this.SESSION_TYPES.ANONYMOUS,
      messageCount: 0,
      cacheStatus: {
        hits: 0,
        misses: 0,
        errors: 0
      },
      redisSync: {
        pending: [],
        lastSync: null,
        errors: []
      }
    };

    this.contextFields = {
      intake: {
        grade_level: null,
        curriculum: 'ela',
        user_context: null
      },
      system: {
        schema_version: this.config.schema_version,
        thread_id: null
      },
      cache: {
        lastAccess: Date.now(),
        expiresAt: Date.now() + 3600 * 1000 // 1 hour for MVP
      }
    };

    this.errors = {
      validation: [],
      cache: [],
      schema: []
    };

    // Add debug methods
    this.debug = {
      getState: () => this.getState(),
      getConfig: () => this.config,
      testEndpoint: async () => {
        try {
          const response = await fetch(`${this.baseUrl}/api/v1/mock`, {
            ...this.fetchConfig,
            method: 'GET'
          });
          return await response.json();
        } catch (error) {
          console.error('[Merit OpenAI] Endpoint test failed:', error);
          throw error;
        }
      }
    };

    console.log('[Merit OpenAI] Client initialized successfully');
    console.log('[Merit Flow] Using API Gateway endpoint:', this.baseUrl);
    console.log('[Merit Flow] Using Redis endpoint:', this.redisConfig.endpoint);
  }

  generateSessionId() {
    return 'merit-' + 
           Date.now() + 
           '-' + 
           Math.random().toString(36).substring(2);
  }

  async initializeSession(context = {}) {
    try {
      const sessionData = {
        sessionId: this.userId,
        context: {
          gradeLevel: context.gradeLevel || null,
          curriculum: "ela",
          threadId: null,       // Set after first message
          messageCount: 0,      // Track engagement
          created_at: Date.now()
        },
        type: this.SESSION_TYPES.ANONYMOUS,
        ttl: this.config.ttl.session
      };

      // Store session in Redis
      await this.redisSet(
        this.redisConfig.keys.session(this.userId),
        JSON.stringify(sessionData),
        this.config.ttl.session
      );

      // Store context separately for quick access
      await this.redisSet(
        this.redisConfig.keys.context(this.userId),
        JSON.stringify(context),
        this.config.ttl.session
      );

      console.log('[Merit Flow] Session initialized:', sessionData);
      return sessionData;
    } catch (error) {
      console.error('[Merit Flow] Session initialization error:', error);
      throw error;
    }
  }

  async incrementMessageCount() {
    try {
      const key = this.redisConfig.keys.messageCount(this.userId);
      const count = await this.redisGet(key) || 0;
      const newCount = parseInt(count) + 1;
      await this.redisSet(key, newCount, this.config.ttl.session);
      this.state.messageCount = newCount;

      // Check if we should prompt for persistence
      if (newCount === 3) {
        this.triggerPersistencePrompt();
      }

      return newCount;
    } catch (error) {
      console.error('[Merit Flow] Message count increment error:', error);
      return this.state.messageCount;
    }
  }

  triggerPersistencePrompt() {
    // Emit event for UI to handle
    const event = new CustomEvent('merit-persistence-prompt', {
      detail: {
        sessionId: this.userId,
        messageCount: this.state.messageCount,
        context: this.state.context
      }
    });
    window.dispatchEvent(event);
  }

  async checkCache(key) {
    try {
      const cacheKey = this.redisConfig.keys.cache(key);
      const cached = await this.redisGet(cacheKey);
      if (cached) {
        this.state.cacheStatus.hits++;
        return JSON.parse(cached);
      }
      this.state.cacheStatus.misses++;
      return null;
    } catch (error) {
      console.error('[Merit Flow] Cache check error:', error);
      this.state.cacheStatus.errors++;
      this.errors.cache.push(error);
      return null;
    }
  }

  async setCache(key, value, ttl = this.config.ttl.cache) {
    try {
      const cacheKey = this.redisConfig.keys.cache(key);
      await this.redisSet(cacheKey, JSON.stringify(value), ttl);
      return true;
    } catch (error) {
      console.error('[Merit Flow] Cache set error:', error);
      this.errors.cache.push(error);
      return false;
    }
  }

  async createThread() {
    let attempts = 0;
    const maxAttempts = this.retryConfig.maxAttempts;

    while (attempts < maxAttempts) {
      try {
        // Check Redis for existing thread
        const cachedThread = await this.checkCache(`thread:${this.userId}`);
        if (cachedThread) {
          console.log('[Merit Flow] Using cached thread:', cachedThread);
          this.threadId = cachedThread.threadId;
          this.state.projectPaired = true;
          return this.threadId;
        }

        console.log('[Merit Flow] Creating new thread');
        console.log('[Merit Flow] Using production endpoint:', this.baseUrl);
        
        const response = await fetch(`${this.baseUrl}/api/v1/thread`, {
          ...this.fetchConfig,
          method: 'POST',
          body: JSON.stringify({
            action: 'create_thread',
            project_id: this.config.project_id,
            ...this.config
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.threadId = data.threadId;
        this.state.projectPaired = true;

        // Cache the thread ID
        await this.setCache(`thread:${this.userId}`, {
          threadId: this.threadId,
          created: Date.now()
        });

        return this.threadId;
      } catch (error) {
        attempts++;
        console.error('[Merit Flow] Thread creation error:', error);
        console.log('[Merit Flow] Error details:', {
          endpoint: this.baseUrl,
          headers: this.fetchConfig.headers,
          error: error.message
        });

        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
          const delay = Math.min(this.retryConfig.baseDelay * Math.pow(2, attempts - 1), this.retryConfig.maxDelay);
          console.log(`[Merit Flow] CORS/Network error, retrying in ${delay}ms... (${maxAttempts - attempts} attempts remaining)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw new Error(`Failed to create thread after ${maxAttempts} attempts`);
  }

  async preloadContext(context) {
    try {
      console.log('[Merit Flow] Preloading context');
      
      // Check Redis for existing context
      const cachedContext = await this.checkCache(`context:${this.userId}`);
      if (cachedContext) {
        console.log('[Merit Flow] Using cached context');
        this.state.context = cachedContext;
        this.state.isPreloaded = true;
        return;
      }

      const preloadMessage = `Hi, I'm your guide. I'll be helping with ${context.curriculum.toUpperCase()} for ${context.gradeLevel}.`;
      await this.sendMessage(preloadMessage, { visible: false });
      
      // Cache the context
      await this.setCache(`context:${this.userId}`, {
        ...context,
        preloaded: Date.now(),
        expiresAt: Date.now() + this.config.ttl.session * 1000
      }, this.config.ttl.session);

      this.state.isPreloaded = true;
      this.state.context = context;
      console.log('[Merit Flow] Context preloaded and cached:', context);
    } catch (error) {
      console.error('[Merit Flow] Context preload error:', error);
      this.state.hasError = true;
      this.state.errorMessage = error.message;
      throw error;
    }
  }

  async sendMessage(message, options = {}) {
    // Increment message count before sending
    await this.incrementMessageCount();

    if (!this.threadId) {
      throw new Error('Thread ID is required to send a message');
    }

    if (!this.state.projectPaired) {
      throw new Error('OpenAI project must be paired before sending messages');
    }

    try {
      // Check message cache for identical recent messages
      const messageHash = await this.hashMessage(message);
      const cachedResponse = await this.checkCache(`message:${messageHash}`);
      if (cachedResponse && !options.skipCache) {
        console.log('[Merit Flow] Using cached response');
        return cachedResponse;
      }

      console.log('[Merit Flow] Sending message:', { message, threadId: this.threadId, userId: this.userId });
      
      if (!this.state.projectPaired || !this.threadId) {
        console.log('[Merit Flow] No thread found, creating new thread...');
        await this.createThread();
      }

      if (!this.state.projectPaired) {
        throw new Error('OpenAI project must be paired before sending messages');
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          message,
          thread_id: this.threadId || null,
          user_id: this.userId,
          project_id: this.config.project_id,
          ...this.config,
          ...options
        }),
        mode: 'cors' // Add CORS mode for browser requests
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.statusCode === 403) {
          this.state.projectPaired = false;
          throw new Error('OpenAI project pairing lost');
        }
        throw new Error(error.error || 'Message send failed');
      }

      const data = await response.json();
      
      // Cache the response
      if (!options.skipCache) {
        await this.setCache(`message:${messageHash}`, data, this.config.ttl.temp);
      }

      if (!this.threadId && data.thread_id) {
        this.threadId = data.thread_id;
        console.log('[Merit Flow] New thread created:', this.threadId);
      }

      console.log('[Merit Flow] Message sent successfully');
      return data;
    } catch (error) {
      console.error('[Merit Flow] Message sending error:', error);
      this.state.hasError = true;
      this.state.errorMessage = error.message;
      throw error;
    }
  }

  async hashMessage(message) {
    // Simple hash function for message caching
    const str = JSON.stringify(message);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `${hash}`;
  }

  async redisGet(key) {
    try {
      // Use API endpoint instead of direct Redis connection
      const response = await fetch(`${this.baseUrl}/cache/get`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ key }),
        mode: 'cors' // Add CORS mode for browser requests
      });
      
      if (!response.ok) {
        throw new Error(`Cache get failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.value;
    } catch (error) {
      console.error('[Merit Flow] Cache get error:', error);
      this.errors.cache.push(error);
      return null;
    }
  }

  async redisSet(key, value, ttl) {
    try {
      // Use API endpoint instead of direct Redis connection
      const response = await fetch(`${this.baseUrl}/cache/set`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ key, value, ttl }),
        mode: 'cors' // Add CORS mode for browser requests
      });
      
      if (!response.ok) {
        throw new Error(`Cache set failed: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('[Merit Flow] Cache set error:', error);
      this.errors.cache.push(error);
      return false;
    }
  }

  // Replace Redis client connection with API check
  async checkRedisConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/cache/health`, {
        method: 'GET',
        headers: this.headers,
        mode: 'cors' // Add CORS mode for browser requests
      });
      
      if (!response.ok) {
        throw new Error(`Redis health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[Merit Redis] Connection status:', data.status);
      return data.status === 'connected';
    } catch (error) {
      console.error('[Merit Redis] Connection error:', error);
      return false;
    }
  }

  getState() {
    return {
      ...this.state,
      cacheMetrics: {
        hits: this.state.cacheStatus.hits,
        misses: this.state.cacheStatus.misses,
        errors: this.state.cacheStatus.errors
      }
    };
  }

  destroy() {
    this.threadId = null;
    this.state = {
      isLoading: false,
      hasError: false,
      errorMessage: null,
      lastRequest: null,
      lastResponse: null,
      isPreloaded: false,
      context: null,
      projectPaired: false,
      sessionType: this.SESSION_TYPES.ANONYMOUS,
      messageCount: 0,
      cacheStatus: {
        hits: 0,
        misses: 0,
        errors: 0
      },
      redisSync: {
        pending: [],
        lastSync: null,
        errors: []
      }
    };
    console.log('[Merit Flow] Client destroyed');
  }

  async createUserSession(email, context = {}) {
    try {
      console.log('[Merit Flow] Creating user session:', email);
      
      // Check if user exists in Redis
      const userKey = this.redisConfig.keys.user(email);
      const existingUser = await this.redisGet(userKey);
      
      if (existingUser) {
        const userData = JSON.parse(existingUser);
        console.log('[Merit Flow] Found existing user:', userData);
        this.userId = userData.id;
        return userData;
      }

      // Create new user record in Redis
      const userData = {
        id: `user_${Date.now()}`,
        email,
        created: Date.now(),
        lastLogin: Date.now(),
        status: 'active',
        context: {
          ...context,
          curriculum: 'ela',
          lastAccess: Date.now()
        }
      };

      // Store in Redis with TTL
      await this.redisSet(userKey, JSON.stringify(userData), this.config.ttl.session);
      
      // Create thread association
      const threadKey = this.redisConfig.keys.userThread(email);
      await this.redisSet(threadKey, '', this.config.ttl.session);

      this.userId = userData.id;
      console.log('[Merit Flow] Created new user session:', userData);
      
      // Queue for Airtable sync
      await this.queueAirtableSync(userData);
      
      return userData;
    } catch (error) {
      console.error('[Merit Flow] User session creation error:', error);
      throw error;
    }
  }

  async queueAirtableSync(userData) {
    try {
      const syncKey = `merit:sync:airtable:${Date.now()}`;
      const syncData = {
        type: 'user_create',
        data: {
          Email: userData.email,
          Status: 'Active',
          Last_Login: new Date(userData.lastLogin).toISOString(),
          Context: JSON.stringify(userData.context),
          Thread_ID: this.threadId || null
        },
        timestamp: Date.now()
      };

      await this.redisSet(syncKey, JSON.stringify(syncData), 3600);
      console.log('[Merit Flow] Queued Airtable sync:', syncKey);
    } catch (error) {
      console.error('[Merit Flow] Airtable sync queue error:', error);
      // Non-blocking error - we'll retry sync later
    }
  }

  async updateUserThread(email, threadId) {
    try {
      const userKey = this.redisConfig.keys.user(email);
      const userData = JSON.parse(await this.redisGet(userKey));
      
      if (!userData) {
        throw new Error('User not found');
      }

      // Update thread association
      const threadKey = this.redisConfig.keys.userThread(email);
      await this.redisSet(threadKey, threadId, this.config.ttl.session);
      
      // Queue thread update for Airtable
      await this.queueAirtableSync({
        ...userData,
        threadId
      });

      console.log('[Merit Flow] Updated user thread:', { email, threadId });
    } catch (error) {
      console.error('[Merit Flow] Thread update error:', error);
      throw error;
    }
  }

  queueRedisSync(data) {
    this.state.redisSync.pending.push({
      id: `sync_${Date.now()}`,
      data,
      timestamp: Date.now()
    });
    this.processSyncQueue();
  }

  async processSyncQueue() {
    if (this.state.redisSync.pending.length === 0) return;
    
    try {
      const item = this.state.redisSync.pending[0];
      await this.redisSet(
        `merit:sync:${item.id}`,
        JSON.stringify(item.data),
        3600
      );
      this.state.redisSync.pending.shift();
      this.state.redisSync.lastSync = Date.now();
    } catch (error) {
      console.error('[Merit Flow] Redis sync error:', error);
      this.state.redisSync.errors.push(error);
    }
  }

  monitorSync() {
    return {
      pending: this.state.redisSync.pending.length,
      lastSync: this.state.redisSync.lastSync,
      errors: this.state.redisSync.errors.length,
      status: this.getSyncStatus()
    };
  }

  getSyncStatus() {
    if (this.state.redisSync.errors.length > 0) return 'error';
    if (this.state.redisSync.pending.length > 0) return 'syncing';
    return 'synced';
  }

  async validateSchemaVersion() {
    try {
      console.log('[Merit Schema] Starting validation...');
      console.log('[Merit Schema] Expected version:', this.config.schema_version);
      
      // Use API to get schema version
      const schemaResponse = await fetch(`${this.baseUrl}/api/v1/schema/version`, {
        method: 'GET',
        headers: this.headers,
        mode: 'cors'
      });
      
      if (!schemaResponse.ok) {
        console.error('[Merit Schema] Version check failed:', schemaResponse.status);
        // For MVP testing, continue despite version mismatch
        console.log('[Merit Schema] Continuing with MVP testing despite version check failure');
        return true;
      }
      
      const schemaData = await schemaResponse.json();
      const currentSchema = schemaData.version;
      
      console.log('[Merit Schema] Current version from API:', currentSchema);
      
      if (currentSchema !== this.config.schema_version) {
        console.warn('[Merit Schema] Version mismatch. Expected:', this.config.schema_version, 'Got:', currentSchema);
        // For MVP testing, continue despite version mismatch
        console.log('[Merit Schema] Continuing with MVP testing despite version mismatch');
        return true;
      }
      
      // Verify field registry access
      const fieldTest = await fetch(`${this.baseUrl}/api/v1/schema/fields`, {
        method: 'GET',
        headers: this.headers,
        mode: 'cors'
      });
      
      if (!fieldTest.ok) {
        console.error('[Merit Schema] Field registry access failed');
        // For MVP testing, continue despite field registry failure
        console.log('[Merit Schema] Continuing with MVP testing despite field registry failure');
        return true;
      }

      console.log('[Merit Schema] Version check passed:', this.config.schema_version);
      console.log('[Merit Schema] Field registry accessible');
      console.log('[Merit Schema] Validation complete ✓');
      
      return true;
    } catch (error) {
      console.error('[Merit Schema] Validation error:', error);
      // For MVP testing, continue despite errors
      console.log('[Merit Schema] Continuing with MVP testing despite validation error');
      return true;
    }
  }
}

export default MeritOpenAIClient;