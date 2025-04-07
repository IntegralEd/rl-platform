/**
 * Development Cycle Monitor
 * 
 * A regular rhythm script that monitors backend updates, MDC content,
 * and suggests synchronization between frontend and backend teams.
 * 
 * Can be set up as a Cursor rule for always-on monitoring.
 */

import { secureFetch } from './api-client.js';
import { log } from './cloudwatch-integration.js';
import { checkBackendUpdates } from './frontend-standup-client.js';

// Configuration
const MONITOR_CONFIG = {
  CHECK_INTERVAL: 3600000, // 1 hour in milliseconds
  BACKEND_ENDPOINT: '/api/v1/status/resources',
  MDC_PATH: '/shared/docs/',
  STANDUP_PATH: '/shared/docs/standup-reports/',
  AUTO_UPDATE: false // Set to true to enable automatic MDC updates
};

// Track last check timestamps
const lastChecks = {
  backend: 0,
  webhook: 0,
  mdc: 0
};

/**
 * Query backend for updated resources and changes
 * @returns {Promise<Object>} Backend update status
 */
async function checkBackendResources() {
  try {
    log('Checking backend for updates', { timestamp: new Date().toISOString() }, 'info');
    
    const response = await secureFetch(MONITOR_CONFIG.BACKEND_ENDPOINT, {
      headers: {
        'X-Resource-Check': 'frontend-monitor'
      }
    });
    
    if (!response || !response.resources) {
      throw new Error('Invalid response from backend resource endpoint');
    }
    
    const newResources = response.resources.filter(r => r.updated_at > lastChecks.backend);
    
    log('Backend resources check completed', { 
      totalResources: response.resources.length,
      newResources: newResources.length,
      changedSince: new Date(lastChecks.backend).toISOString()
    }, 'info');
    
    lastChecks.backend = Date.now();
    
    return {
      success: true,
      newResources,
      allResources: response.resources
    };
  } catch (error) {
    log('Backend check failed', { error: error.message }, 'error');
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check webhook for new standup reports from backend team
 * @returns {Promise<Object>} Webhook update status
 */
async function checkWebhookReports() {
  try {
    log('Checking webhook for backend team updates', { timestamp: new Date().toISOString() }, 'info');
    
    // Use the imported checkBackendUpdates function from frontend-standup-client.js
    const updates = await checkBackendUpdates();
    
    // Filter for reports since last check
    const newReports = updates.filter(update => {
      const reportDate = new Date(update.created).getTime();
      return reportDate > lastChecks.webhook;
    });
    
    log('Webhook check completed', { 
      totalReports: updates.length,
      newReports: newReports.length,
      changedSince: new Date(lastChecks.webhook).toISOString()
    }, 'info');
    
    lastChecks.webhook = Date.now();
    
    return {
      success: true,
      newReports,
      allReports: updates
    };
  } catch (error) {
    log('Webhook check failed', { error: error.message }, 'error');
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check for MDC files that need updates based on backend changes
 * @param {Array} backendResources - Updated backend resources
 * @returns {Promise<Object>} MDC status
 */
async function checkMdcDocumentation(backendResources) {
  try {
    log('Checking MDC documentation for update needs', { timestamp: new Date().toISOString() }, 'info');
    
    const mdcUpdateNeeds = [];
    
    // For each backend resource, check if we need to update related MDC
    for (const resource of backendResources) {
      // Try to find corresponding MDC file
      const resourceType = resource.type.toLowerCase();
      const possibleMdcPaths = [
        `${MONITOR_CONFIG.MDC_PATH}${resourceType}-guide.mdc`,
        `${MONITOR_CONFIG.MDC_PATH}${resourceType}-implementation.mdc`,
        `${MONITOR_CONFIG.MDC_PATH}${resourceType}.mdc`
      ];
      
      for (const mdcPath of possibleMdcPaths) {
        try {
          const response = await fetch(mdcPath, { method: 'HEAD' });
          if (response.ok) {
            // Found MDC file, check if it needs update
            const mdcResponse = await fetch(mdcPath);
            const mdcContent = await mdcResponse.text();
            
            // Check for update markers in content
            if (mdcContent.includes(`Last updated:`)) {
              const updateMatch = mdcContent.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/);
              if (updateMatch) {
                const mdcUpdateDate = new Date(updateMatch[1]).getTime();
                const resourceUpdateDate = new Date(resource.updated_at).getTime();
                
                if (resourceUpdateDate > mdcUpdateDate) {
                  mdcUpdateNeeds.push({
                    path: mdcPath,
                    resource: resource.name,
                    resourceUpdated: new Date(resource.updated_at).toISOString(),
                    mdcUpdated: new Date(mdcUpdateDate).toISOString(),
                    updateReason: `Backend resource ${resource.name} was updated after MDC file`
                  });
                }
              }
            }
          }
        } catch (e) {
          // Skip this MDC path
        }
      }
    }
    
    log('MDC check completed', {
      updatesNeeded: mdcUpdateNeeds.length
    }, 'info');
    
    lastChecks.mdc = Date.now();
    
    return {
      success: true,
      mdcUpdateNeeds
    };
  } catch (error) {
    log('MDC check failed', { error: error.message }, 'error');
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run the full development cycle check
 * @returns {Promise<Object>} Complete cycle results
 */
async function runDevelopmentCycleCheck() {
  const results = {
    timestamp: new Date().toISOString(),
    backend: null,
    webhook: null,
    mdc: null,
    suggestedActions: []
  };
  
  try {
    // Check backend resources
    results.backend = await checkBackendResources();
    
    // Check standup reports via webhook
    results.webhook = await checkWebhookReports();
    
    // Check MDC files if we have backend resources
    if (results.backend.success && results.backend.newResources.length > 0) {
      results.mdc = await checkMdcDocumentation(results.backend.newResources);
    }
    
    // Generate suggested actions
    
    // If backend has new resources, suggest MDC updates
    if (results.backend.success && results.backend.newResources.length > 0) {
      results.suggestedActions.push({
        type: 'backend_review',
        description: `Review ${results.backend.newResources.length} new backend resources for potential integration`,
        priority: 'high',
        resources: results.backend.newResources.map(r => r.name)
      });
    }
    
    // If MDC needs updates, suggest updates
    if (results.mdc && results.mdc.success && results.mdc.mdcUpdateNeeds.length > 0) {
      results.suggestedActions.push({
        type: 'mdc_update',
        description: `Update ${results.mdc.mdcUpdateNeeds.length} MDC files to match backend changes`,
        priority: 'medium',
        files: results.mdc.mdcUpdateNeeds.map(n => n.path)
      });
    }
    
    // Check if we need to create a new standup report
    if ((results.backend.success && results.backend.newResources.length > 0) ||
        (results.webhook.success && results.webhook.newReports.length > 0)) {
      results.suggestedActions.push({
        type: 'standup_sync',
        description: 'Create a new standup report to align with backend team',
        priority: 'medium'
      });
    }
    
    return formatCheckResults(results);
  } catch (error) {
    log('Development cycle check failed', { error: error.message }, 'error');
    return {
      success: false,
      error: error.message,
      suggestedActions: []
    };
  }
}

/**
 * Format the check results for display
 * @param {Object} results - Raw check results
 * @returns {Object} Formatted results
 */
function formatCheckResults(results) {
  let output = `# Development Cycle Check: ${new Date(results.timestamp).toLocaleString()}\n\n`;
  
  // Backend resources
  if (results.backend) {
    if (results.backend.success) {
      output += `## Backend Resources\n`;
      output += `- Found ${results.backend.allResources.length} total resources\n`;
      output += `- ${results.backend.newResources.length} new/updated resources\n`;
      
      if (results.backend.newResources.length > 0) {
        output += `\n### New Backend Resources\n`;
        results.backend.newResources.forEach(resource => {
          output += `- ${resource.name} (${resource.type}): Updated ${new Date(resource.updated_at).toLocaleString()}\n`;
          if (resource.description) {
            output += `  - ${resource.description}\n`;
          }
        });
      }
    } else {
      output += `## Backend Resources Check Failed\n`;
      output += `- Error: ${results.backend.error}\n`;
    }
  }
  
  // Webhook reports
  if (results.webhook) {
    if (results.webhook.success) {
      output += `\n## Backend Team Reports\n`;
      output += `- Found ${results.webhook.allReports.length} total reports\n`;
      output += `- ${results.webhook.newReports.length} new reports\n`;
      
      if (results.webhook.newReports.length > 0) {
        output += `\n### New Backend Team Reports\n`;
        results.webhook.newReports.forEach(report => {
          output += `- ${report.title}\n`;
          if (report.priorities && report.priorities.length > 0) {
            output += `  - Priorities: ${report.priorities.join(', ')}\n`;
          }
        });
      }
    } else {
      output += `\n## Backend Team Reports Check Failed\n`;
      output += `- Error: ${results.webhook.error}\n`;
    }
  }
  
  // MDC documentation
  if (results.mdc) {
    if (results.mdc.success) {
      output += `\n## MDC Documentation\n`;
      
      if (results.mdc.mdcUpdateNeeds.length > 0) {
        output += `- Found ${results.mdc.mdcUpdateNeeds.length} MDC files that need updates\n`;
        output += `\n### MDC Files Needing Updates\n`;
        results.mdc.mdcUpdateNeeds.forEach(need => {
          output += `- ${need.path}\n`;
          output += `  - Reason: ${need.updateReason}\n`;
          output += `  - Resource updated: ${new Date(need.resourceUpdated).toLocaleString()}\n`;
          output += `  - MDC last updated: ${new Date(need.mdcUpdated).toLocaleString()}\n`;
        });
      } else {
        output += `- All MDC files are up to date\n`;
      }
    } else {
      output += `\n## MDC Documentation Check Failed\n`;
      output += `- Error: ${results.mdc.error}\n`;
    }
  }
  
  // Suggested actions
  if (results.suggestedActions.length > 0) {
    output += `\n## Suggested Actions\n`;
    results.suggestedActions.forEach(action => {
      if (action.type === 'backend_review') {
        output += `- Review backend changes: ${action.resources.length} resources updated\n`;
      } else if (action.type === 'mdc_update') {
        output += `- Update MDC files: ${action.files.join(', ')}\n`;
      } else if (action.type === 'standup_sync') {
        output += `- Create a new standup report addressing backend updates\n`;
      }
    });
  } else {
    output += `\n## Suggested Actions\n`;
    output += `- No actions required at this time\n`;
  }
  
  return {
    ...results,
    formattedOutput: output
  };
}

/**
 * Start the development cycle monitoring
 * @param {boolean} runOnce - Run only once, then exit
 */
function startMonitoring(runOnce = false) {
  log('Starting development cycle monitoring', { 
    interval: MONITOR_CONFIG.CHECK_INTERVAL,
    runOnce
  }, 'info');
  
  runDevelopmentCycleCheck().then(results => {
    console.log(results.formattedOutput);
    
    if (MONITOR_CONFIG.AUTO_UPDATE && results.suggestedActions.some(action => action.type === 'standup_sync')) {
      console.log('Auto-update is enabled. Would create a new standup report here.');
      // Implementation for auto-creating standup reports using the new webhook approach would go here
    }
    
    if (!runOnce) {
      setTimeout(() => startMonitoring(false), MONITOR_CONFIG.CHECK_INTERVAL);
    }
  }).catch(error => {
    console.error('Development cycle check failed:', error);
    log('Development cycle check error', { error: error.message }, 'error');
    
    if (!runOnce) {
      setTimeout(() => startMonitoring(false), MONITOR_CONFIG.CHECK_INTERVAL);
    }
  });
}

// Export functions for external use
export {
  startMonitoring,
  runDevelopmentCycleCheck,
  MONITOR_CONFIG
};

// Auto-start if this is being loaded directly
if (typeof window !== 'undefined' && window.autoStartMonitor) {
  startMonitoring(false);
} 