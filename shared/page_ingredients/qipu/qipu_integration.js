/**
 * Qipu Review System Integration
 * 
 * This script provides the functionality to integrate the Qipu review UI components
 * with your page and handle the submission of review comments to the backend.
 */

class QipuReview {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || 'https://hook.us1.make.com/your-webhook-id',
      authRequired: config.authRequired !== false,
      autoInitialize: config.autoInitialize !== false,
      ...config
    };
    
    this.userData = null;
    this.canvas = null;
    this.canvasObjects = [];
    
    if (this.config.autoInitialize) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the Qipu review system
   */
  initialize() {
    this.loadUIComponents()
      .then(() => {
        this.setupEventListeners();
        this.validateAuth();
        
        // Initialize welcome modal with review goals if available
        if (this.config.reviewerName) {
          document.getElementById('reviewer-name').textContent = this.config.reviewerName;
        }
        
        if (this.config.reviewGoal) {
          document.getElementById('review-goal').textContent = this.config.reviewGoal;
        }
      })
      .catch(error => {
        console.error('Failed to initialize Qipu review system:', error);
      });
  }
  
  /**
   * Load UI components by injecting the HTML into the page
   */
  async loadUIComponents() {
    try {
      // If components are already in the DOM, don't load again
      if (document.getElementById('paintbrush-toggle')) {
        return;
      }
      
      const response = await fetch('/shared/page_ingredients/qipu/qipu_review_ui.html');
      const html = await response.text();
      
      // Create a container for the UI
      const container = document.createElement('div');
      container.id = 'qipu-container';
      container.innerHTML = html;
      
      document.body.appendChild(container);
    } catch (error) {
      console.error('Error loading Qipu UI components:', error);
      throw error;
    }
  }
  
  /**
   * Setup event listeners for UI components
   */
  setupEventListeners() {
    const paintbrushToggle = document.getElementById('paintbrush-toggle');
    const footer = document.getElementById('qipu-comment-footer');
    const modal = document.getElementById('welcome-modal');
    const confirmBox = document.getElementById('welcome-confirm');
    const confirmBtn = document.getElementById('welcome-confirm-btn');
    
    if (!paintbrushToggle || !footer) {
      console.error('Qipu UI components not found in the DOM');
      return;
    }
    
    // Toggle review toolbar
    paintbrushToggle.onclick = () => {
      const isOpen = footer.style.display === 'flex';
      footer.style.display = isOpen ? 'none' : 'flex';
      paintbrushToggle.style.display = isOpen ? 'block' : 'none';
    };
    
    // Handle welcome modal confirmation
    confirmBox.addEventListener('change', () => {
      confirmBtn.disabled = !confirmBox.checked;
    });
    
    confirmBtn.onclick = () => {
      if (confirmBox.checked) {
        modal.style.display = 'none';
      } else {
        alert('Please confirm your agreement before continuing.');
      }
    };
    
    // Setup tool functionality
    document.querySelectorAll('.qipu-tool').forEach(tool => {
      tool.addEventListener('click', (e) => {
        const action = e.target.getAttribute('title');
        this.handleToolAction(action);
      });
    });
    
    // Submit review button
    document.querySelector('[onclick="submitReview()"]').onclick = () => {
      this.submitReview();
    };
  }
  
  /**
   * Handle actions from review tools
   */
  handleToolAction(action) {
    switch(action) {
      case 'Camera':
        this.showCaptureOverlay();
        break;
      case 'Draw':
        this.startDrawing();
        break;
      case 'Text':
        this.addText();
        break;
      case 'Arrow':
        this.addArrow();
        break;
      case 'Erase':
        this.clearAnnotations();
        break;
      case 'Comment':
        this.addComment();
        break;
    }
  }
  
  /**
   * Show screenshot capture overlay
   */
  showCaptureOverlay() {
    const overlay = document.getElementById('capture-overlay');
    overlay.style.display = 'block';
    
    // Add event listener for capturing screenshot
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.captureScreenshot();
      }
    };
  }
  
  /**
   * Capture screenshot of the selected area
   */
  captureScreenshot() {
    const overlay = document.getElementById('capture-overlay');
    const box = document.getElementById('capture-box');
    
    // Get the position and size of the capture box
    const rect = box.getBoundingClientRect();
    
    // Use html2canvas to capture the area
    if (typeof html2canvas === 'function') {
      html2canvas(document.body, {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        logging: false,
        useCORS: true
      }).then(canvas => {
        // Add the screenshot to annotations
        this.canvasObjects.push({
          type: 'screenshot',
          content: canvas.toDataURL(),
          position: { x: rect.left, y: rect.top },
          size: { width: rect.width, height: rect.height }
        });
        
        overlay.style.display = 'none';
        
        // Show preview of the screenshot
        this.showScreenshotPreview(canvas.toDataURL());
      });
    } else {
      console.error('html2canvas is not available. Make sure to include the library.');
      alert('Screenshot functionality is not available. Please contact support.');
      overlay.style.display = 'none';
    }
  }
  
  /**
   * Show preview of captured screenshot
   */
  showScreenshotPreview(dataUrl) {
    // Implementation for showing screenshot preview
    console.log('Screenshot captured:', dataUrl.substring(0, 50) + '...');
    // Future implementation: Display the screenshot in a preview container
  }
  
  /**
   * Start drawing mode
   */
  startDrawing() {
    // Implementation for drawing functionality
    console.log('Drawing mode activated');
    // Future implementation: Initialize fabric.js canvas for drawing
  }
  
  /**
   * Add text annotation
   */
  addText() {
    const text = prompt('Enter your text annotation:');
    if (text) {
      this.canvasObjects.push({
        type: 'text',
        content: text,
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      });
      
      console.log('Text annotation added:', text);
    }
  }
  
  /**
   * Add arrow annotation
   */
  addArrow() {
    // Implementation for adding arrow
    console.log('Arrow tool activated');
    // Future implementation: Draw arrow on fabric.js canvas
  }
  
  /**
   * Clear all annotations
   */
  clearAnnotations() {
    this.canvasObjects = [];
    console.log('All annotations cleared');
  }
  
  /**
   * Add comment without visual annotation
   */
  addComment() {
    const comment = prompt('Enter your comment:');
    if (comment) {
      this.canvasObjects.push({
        type: 'comment',
        content: comment,
        position: null // General comment not tied to specific position
      });
      
      console.log('Comment added:', comment);
    }
  }
  
  /**
   * Submit review with all annotations
   */
  submitReview() {
    if (this.canvasObjects.length === 0) {
      alert('Please add at least one annotation or comment before submitting.');
      return;
    }
    
    const reviewData = {
      thread_id: `${window.location.href}#${Date.now()}`,
      url: window.location.href,
      timestamp: Date.now(),
      user_id: this.userData?.userId || 'anonymous',
      user_email: this.userData?.email || 'anonymous@example.com',
      user_org: this.userData?.orgId || 'unknown',
      annotations: this.canvasObjects,
      created_at: new Date().toISOString()
    };
    
    // Submit to API endpoint
    fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      return response.json();
    })
    .then(data => {
      alert('Review submitted successfully!');
      this.clearAnnotations();
      
      // Hide the review footer
      const footer = document.getElementById('qipu-comment-footer');
      footer.style.display = 'none';
      
      // Show the toggle button again
      const paintbrushToggle = document.getElementById('paintbrush-toggle');
      paintbrushToggle.style.display = 'block';
    })
    .catch(error => {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again or contact support.');
    });
  }
  
  /**
   * Validate user authentication
   */
  validateAuth() {
    if (!this.config.authRequired) {
      // Skip authentication if not required
      return;
    }
    
    // Check URL parameters for authentication data
    const params = new URLSearchParams(window.location.search);
    const reviewEmail = params.get('RevEmail');
    const userId = params.get('User_ID');
    const orgId = params.get('Org_ID');
    const reviewToken = params.get('review_token');
    
    if (reviewEmail && userId && orgId) {
      // Authenticate with URL parameters
      this.authenticateUser({
        email: reviewEmail,
        userId: userId,
        orgId: orgId
      });
    } else if (reviewToken) {
      // Authenticate with review token
      this.authenticateWithToken(reviewToken);
    } else {
      // Show welcome modal for unauthenticated users
      document.getElementById('welcome-modal').style.display = 'flex';
    }
  }
  
  /**
   * Authenticate user with provided data
   */
  authenticateUser(userData) {
    this.userData = userData;
    console.log('User authenticated:', userData);
    
    // Hide welcome modal if it's visible
    document.getElementById('welcome-modal').style.display = 'none';
    
    // Update UI with user data if needed
    if (userData.email) {
      const reviewerName = userData.email.split('@')[0];
      document.getElementById('reviewer-name').textContent = reviewerName;
    }
  }
  
  /**
   * Authenticate with review token
   */
  authenticateWithToken(token) {
    // Implementation for token-based authentication
    // Future implementation: Validate token with backend
    console.log('Authentication with token:', token);
    
    // For now, just set a basic user
    this.authenticateUser({
      email: 'reviewer@example.com',
      userId: 'token_user',
      orgId: 'token_org'
    });
  }
}

// Export the class for use in other scripts
window.QipuReview = QipuReview;

// Auto-initialize if the script is loaded directly
if (typeof module === 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.qipuReviewInstance = new QipuReview();
  });
} 