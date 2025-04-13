/**
 * Frontend Standup Report Client
 * 
 * A standardized, secure way to submit standup reports via webhook
 * This replaces all previous direct Airtable implementations
 * 
 * Updated: April 12, 2025
 */

// Configuration
const STANDUP_CONFIG = {
  WEBHOOK_URL: 'https://hook.us1.make.com/2p4n1yv1urc4upm9xlkiy459t1yd87fj',
  FRONTEND_SOURCE: 'Frontend_Cursor',
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  }
};

/**
 * Submit a standup report via webhook
 * 
 * @param {Object} options - Report options
 * @param {string} options.developer - Developer name
 * @param {string[]} options.findings - Completed work items
 * @param {string[]} options.priorities - Current priorities
 * @param {string[]} options.nextSteps - Planned next steps
 * @param {string[]} options.futureFeatures - Future feature ideas
 * @param {string} [options.version] - Optional version number (defaults to 1)
 * @returns {Promise<Object>} - Webhook response
 */
export async function submitStandupReport(options) {
  // Validate required fields
  if (!options.developer) {
    throw new Error('Developer name is required');
  }
  
  if (!options.findings || !options.findings.length) {
    throw new Error('At least one finding is required');
  }
  
  if (!options.priorities || !options.priorities.length) {
    throw new Error('At least one priority is required');
  }
  
  if (!options.nextSteps || !options.nextSteps.length) {
    throw new Error('At least one next step is required');
  }
  
  if (!options.futureFeatures || !options.futureFeatures.length) {
    throw new Error('At least one future feature is required');
  }
  
  // Generate ISO timestamp
  const now = new Date();
  const isoTimestamp = now.toISOString();
  
  // Format date components for report ID and title
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const version = options.version || 1;
  
  // Create unique report ID
  const dateStr = `${year}-${month}-${day}`;
  const reportId = `${dateStr}-001`; // Append sequential number
  
  // Create report title with version
  const title = `${STANDUP_CONFIG.FRONTEND_SOURCE} | ${year}.${month}.${day}.${version}`;
  
  // Construct payload according to webhook specification
  const payload = {
    Title: title,
    ID: reportId,
    Created: isoTimestamp,
    Findings: options.findings,
    Priorities: options.priorities,
    Next_Steps: options.nextSteps,
    Future_Features: options.futureFeatures
  };
  
  // Send report to webhook
  try {
    const response = await fetch(STANDUP_CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: STANDUP_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook error (${response.status}): ${errorText}`);
    }
    
    return {
      success: true,
      reportId,
      title,
      timestamp: isoTimestamp,
      response: await response.json()
    };
  } catch (error) {
    console.error('Failed to submit standup report:', error);
    throw error;
  }
}

/**
 * Add standup reporting to a build process
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.developer - Developer name
 * @param {boolean} [options.checkUpdates=false] - Whether to check for backend updates
 * @returns {Object} Setup result
 */
export function addStandupReporting(options) {
  console.log(`Setting up standup reporting for ${options.developer}`);
  
  if (options.checkUpdates) {
    // Check for backend updates at the beginning
    checkBackendUpdates()
      .then(updates => {
        if (updates.length > 0) {
          console.log('Backend updates that may affect frontend:');
          updates.forEach(update => console.log(`- ${update.title}`));
        } else {
          console.log('No recent backend updates affecting frontend.');
        }
      })
      .catch(error => {
        console.error('Error checking backend updates:', error);
      });
  }
  
  // Register build completion handler
  process.on('exit', (code) => {
    if (code === 0) {
      // Only report on successful builds
      const findings = ['Completed successful build'];
      
      // Could add git diff information here
      
      submitStandupReport({
        developer: options.developer,
        findings,
        priorities: ['Build automation'],
        nextSteps: ['Continue development'],
        futureFeatures: ['Enhance build process']
      }).catch(error => {
        console.error('Failed to submit build report:', error);
      });
    }
  });
  
  return {
    success: true,
    developer: options.developer,
    checkingUpdates: options.checkUpdates
  };
}

/**
 * Check for recent backend updates that might affect frontend
 * 
 * @returns {Promise<Array>} Backend updates
 */
export async function checkBackendUpdates() {
  try {
    // Query webhook for recent backend reports
    const response = await fetch(`${STANDUP_CONFIG.WEBHOOK_URL}/query`, {
      method: 'POST',
      headers: STANDUP_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify({
        team: 'Backend',
        days: 1, // Last 24 hours
        tags: ['frontend-impact']
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check updates: ${response.status}`);
    }
    
    const updates = await response.json();
    return updates.filter(update => update.team === 'Backend');
  } catch (error) {
    console.error('Error checking backend updates:', error);
    return [];
  }
}

// Export in CommonJS format for direct Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    submitStandupReport,
    addStandupReporting,
    checkBackendUpdates,
    STANDUP_CONFIG
  };
} 