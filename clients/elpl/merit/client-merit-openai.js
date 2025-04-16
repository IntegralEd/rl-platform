/*
 * @component MeritOpenAIClient
 * @description Handles OpenAI Assistant interactions for Merit chat with Redis caching
 * @version 1.0.19
 */

class MeritOpenAIClient {
  constructor() {
    // Core configuration
    this.threadId = null;
    this.assistantId = 'asst_QoAA395ibbyMImFJERbG2hKT'; // Merit Assistant
    this.userId = 'default_user';

    // API Configuration
    const ENDPOINTS = {
      PROD: 'https://api.recursivelearning.app/dev',
      DEV: 'https://api.recursivelearning.app/dev',
      REDIS: 'redis://redis.recursivelearning.app:6379',
      contextPrefix: 'merit:ela:context',
      threadPrefix: 'merit:ela:thread',
      cachePrefix: 'merit:ela:cache'
    };

    // Redis Configuration
    this.redisConfig = {
      endpoint: ENDPOINTS.REDIS,
      defaultTTL: 3600, // 1 hour for MVP
      keys: {
        context: (userId) => `${ENDPOINTS.contextPrefix}:${userId}`,
        thread: (userId) => `${ENDPOINTS.threadPrefix}:${userId}`,
        cache: (key) => `${ENDPOINTS.cachePrefix}:${key}`,
        user: (email) => `merit:user:${email}`,
        userThread: (email) => `merit:user:thread:${email}`
      }
    };

    this.baseUrl = ENDPOINTS.PROD;
    this.fallbackUrl = ENDPOINTS.PROD;
    this.retryAttempts = 3;
    this.currentAttempt = 0;
    this.config = {
      org_id: 'recdg5Hlm3VVaBA2u',
      assistant_id: this.assistantId,
      model: 'gpt-4o',
      schema_version: '04102025.B01',
      project_id: 'proj_V4lrL1OSfydWCFW0zjgwrFRT',
      ttl: {
        session: 3600,    // 1 hour for MVP
        cache: 3600,      // 1 hour for MVP
        temp: 3600        // 1 hour for MVP
      }
    };

    this.headers = {
      'Content-Type': 'application/json',
      'X-Project-ID': this.config.project_id
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

    console.log('[Merit Flow] OpenAI client initialized with Redis support');
    console.log('[Merit Flow] Using API endpoint:', this.baseUrl);
    console.log('[Merit Flow] Using Redis endpoint:', this.redisConfig.endpoint);
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
    try {
      // Check Redis for existing thread
      const cachedThread = await this.checkCache(`thread:${this.userId}`);
      if (cachedThread) {
        console.log('[Merit Flow] Using cached thread:', cachedThread);
        this.threadId = cachedThread.threadId;
        this.state.projectPaired = true;
        return this.threadId;
      }

      console.log(`[Merit Flow] Creating new thread (Attempt ${this.currentAttempt + 1}/${this.retryAttempts})`);
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          action: 'create_thread',
          project_id: this.config.project_id,
          ...this.config
        })
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.statusCode === 403) {
          throw new Error('OpenAI project pairing required');
        }
        throw new Error(error.error || 'Thread creation failed');
      }

      const data = await response.json();
      this.threadId = `threads:${this.config.org_id}:${this.userId}:${data.thread_id}`;
      this.state.projectPaired = true;

      // Cache the new thread
      await this.setCache(`thread:${this.userId}`, {
        threadId: this.threadId,
        created: Date.now(),
        expiresAt: Date.now() + this.config.ttl.session * 1000
      }, this.config.ttl.session);

      console.log('[Merit Flow] Thread created and cached:', this.threadId);
      return this.threadId;
    } catch (error) {
      console.error('[Merit Flow] Thread creation error:', error);
      if (error.message.includes('ERR_NAME_NOT_RESOLVED') && this.currentAttempt < this.retryAttempts) {
        this.currentAttempt++;
        console.log('[Merit Flow] DNS resolution failed, trying fallback endpoint');
        this.baseUrl = this.fallbackUrl;
        return this.createThread();
      }
      this.state.hasError = true;
      this.state.errorMessage = error.message;
      throw error;
    }
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
    console.log('[Merit Flow] Sending message:', { message, threadId: this.threadId, userId: this.userId });
    
    if (!this.state.projectPaired || !this.threadId) {
      console.log('[Merit Flow] No thread found, creating new thread...');
      await this.createThread();
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
        })
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
    // Redis GET implementation
    // TODO: Implement actual Redis GET
    return localStorage.getItem(key);
  }

  async redisSet(key, value, ttl) {
    // Redis SET implementation
    // TODO: Implement actual Redis SET
    localStorage.setItem(key, value);
    return true;
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
}

export default MeritOpenAIClient; 