/**
 * Development Cycle Monitor
 * 
 * A regular rhythm script that monitors backend updates, MDC content,
 * and suggests synchronization between frontend and backend teams.
 * 
 * Can be set up as a Cursor rule for always-on monitoring.
 */

import { queryStandupReports } from './airtable-query.js';
import { secureFetch } from './api-client.js';
import { log } from './cloudwatch-integration.js';

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
  airtable: 0,
  mdc: 0
};

/**
 * Query backend for updated resources and changes
 * @returns {Promise<Object>} Backend update status
 */
async function checkBackendUpdates() {
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
 * Check Airtable for new standup reports from backend team
 * @returns {Promise<Object>} Airtable update status
 */
async function checkAirtableReports() {
  try {
    log('Checking Airtable for backend team updates', { timestamp: new Date().toISOString() }, 'info');
    
    // Query backend team reports
    const result = await queryStandupReports({
      team: 'Backend Cursor',
      maxRecords: 5,
      sortField: 'Date',
      sortDirection: 'desc'
    });
    
    if (!result.success) {
      throw new Error(`Failed to query Airtable: ${result.error}`);
    }
    
    // Filter for reports since last check
    const newReports = result.records.filter(record => {
      const reportDate = new Date(record.fields.Date).getTime();
      return reportDate > lastChecks.airtable;
    });
    
    log('Airtable check completed', { 
      totalReports: result.records.length,
      newReports: newReports.length,
      changedSince: new Date(lastChecks.airtable).toISOString()
    }, 'info');
    
    lastChecks.airtable = Date.now();
    
    return {
      success: true,
      newReports,
      allReports: result.records
    };
  } catch (error) {
    log('Airtable check failed', { error: error.message }, 'error');
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
    airtable: null,
    mdc: null,
    suggestedActions: []
  };
  
  try {
    // Check backend updates
    results.backend = await checkBackendUpdates();
    
    // Check Airtable for backend team reports
    results.airtable = await checkAirtableReports();
    
    // Only check MDC if we have backend resources
    if (results.backend.success && results.backend.newResources.length > 0) {
      results.mdc = await checkMdcDocumentation(results.backend.newResources);
      
      // Generate suggested actions
      if (results.mdc.success && results.mdc.mdcUpdateNeeds.length > 0) {
        results.suggestedActions.push({
          type: 'mdc_update',
          description: 'Update MDC documentation to reflect backend changes',
          items: results.mdc.mdcUpdateNeeds
        });
      }
    }
    
    // Check if we need to create a new standup report
    if (results.airtable.success && results.airtable.newReports.length > 0) {
      results.suggestedActions.push({
        type: 'standup_sync',
        description: 'Create a new standup report to align with backend team',
        backendReports: results.airtable.newReports.slice(0, 2)
      });
    }
    
    log('Development cycle check completed', {
      suggestedActions: results.suggestedActions.length
    }, 'info');
    
    return results;
  } catch (error) {
    log('Development cycle check failed', { error: error.message }, 'error');
    return {
      ...results,
      error: error.message
    };
  }
}

/**
 * Format check results for display
 * @param {Object} results - Development cycle check results
 * @returns {string} Formatted results
 */
function formatCheckResults(results) {
  let output = `# Development Cycle Check: ${results.timestamp}\n\n`;
  
  if (results.error) {
    output += `⚠️ **Check Failed**: ${results.error}\n\n`;
  }
  
  // Backend status
  output += `## Backend Resources\n`;
  if (results.backend.success) {
    output += `- ${results.backend.newResources.length} new/updated resources found\n`;
    
    if (results.backend.newResources.length > 0) {
      output += `\nUpdated resources:\n`;
      results.backend.newResources.forEach(resource => {
        output += `- **${resource.name}** (${resource.type}) - Updated ${new Date(resource.updated_at).toLocaleString()}\n`;
      });
    }
  } else {
    output += `- ❌ Check failed: ${results.backend.error}\n`;
  }
  
  // Airtable status
  output += `\n## Backend Team Reports\n`;
  if (results.airtable.success) {
    output += `- ${results.airtable.newReports.length} new reports found\n`;
    
    if (results.airtable.newReports.length > 0) {
      output += `\nLatest reports:\n`;
      results.airtable.newReports.slice(0, 2).forEach(report => {
        output += `- **${report.fields.Title}** - ${report.fields.Date}\n`;
        if (report.fields.Summary) {
          output += `  Summary: ${report.fields.Summary.slice(0, 100)}${report.fields.Summary.length > 100 ? '...' : ''}\n`;
        }
      });
    }
  } else {
    output += `- ❌ Check failed: ${results.airtable.error}\n`;
  }
  
  // MDC status
  if (results.mdc) {
    output += `\n## Documentation Status\n`;
    if (results.mdc.success) {
      output += `- ${results.mdc.mdcUpdateNeeds.length} documents need updates\n`;
      
      if (results.mdc.mdcUpdateNeeds.length > 0) {
        output += `\nDocuments to update:\n`;
        results.mdc.mdcUpdateNeeds.forEach(doc => {
          output += `- **${doc.path.split('/').pop()}**\n`;
          output += `  Reason: ${doc.updateReason}\n`;
        });
      }
    } else {
      output += `- ❌ Check failed: ${results.mdc.error}\n`;
    }
  }
  
  // Suggested actions
  if (results.suggestedActions.length > 0) {
    output += `\n## Suggested Actions\n`;
    results.suggestedActions.forEach(action => {
      output += `### ${action.description}\n`;
      
      if (action.type === 'mdc_update') {
        action.items.forEach(item => {
          output += `- Update \`${item.path.split('/').pop()}\` to reflect changes in ${item.resource}\n`;
        });
      } else if (action.type === 'standup_sync') {
        output += `- Create a new standup report addressing backend updates\n`;
        output += `- Reference the latest backend report: **${action.backendReports[0].fields.Title}**\n`;
      }
    });
  } else {
    output += `\n## Suggested Actions\n- No actions needed at this time\n`;
  }
  
  return output;
}

/**
 * Start monitoring with regular checks
 * Runs once immediately and then at the configured interval
 */
function startMonitoring() {
  log('Starting development cycle monitoring', {
    interval: `${MONITOR_CONFIG.CHECK_INTERVAL / 60000} minutes`
  }, 'info');
  
  // Run initial check
  runDevelopmentCycleCheck().then(results => {
    const formattedResults = formatCheckResults(results);
    console.log(formattedResults);
    
    // Create a standup report if needed and auto-update is enabled
    if (MONITOR_CONFIG.AUTO_UPDATE && 
        results.suggestedActions.some(action => action.type === 'standup_sync')) {
      console.log('Auto-update is enabled. Would create a new standup report here.');
      // Implementation for auto-creating standup reports would go here
    }
  });
  
  // Set up interval for regular checks
  const intervalId = setInterval(async () => {
    const results = await runDevelopmentCycleCheck();
    const formattedResults = formatCheckResults(results);
    console.log(formattedResults);
    
    // Take automated actions if enabled
    if (MONITOR_CONFIG.AUTO_UPDATE && results.suggestedActions.length > 0) {
      console.log('Auto-update is enabled. Would take suggested actions here.');
      // Implementation for auto-updates would go here
    }
  }, MONITOR_CONFIG.CHECK_INTERVAL);
  
  // Return a function to stop monitoring
  return () => {
    clearInterval(intervalId);
    log('Development cycle monitoring stopped', {}, 'info');
  };
}

// For use in cursor rules or manual execution
export {
  runDevelopmentCycleCheck,
  formatCheckResults,
  startMonitoring,
  MONITOR_CONFIG
};

// For manual testing in console
if (typeof window !== 'undefined') {
  window.developmentCycleMonitor = {
    run: runDevelopmentCycleCheck,
    start: startMonitoring,
    config: MONITOR_CONFIG
  };
  
  console.log('📊 Development Cycle Monitor loaded');
  console.log('Run a check: developmentCycleMonitor.run()');
  console.log('Start monitoring: developmentCycleMonitor.start()');
} 