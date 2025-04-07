/**
 * Airtable Query Utility
 * 
 * Simple tool to query Airtable for existing standup reports
 * and verify the bidirectional reporting system is working.
 */

import { airtableFetch, AIRTABLE_CONFIG } from './standup_reporting_airtable.js';
import { log } from './cloudwatch-integration.js';

/**
 * Query standup reports in Airtable
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Query results
 */
async function queryStandupReports(options = {}) {
  try {
    const defaultOptions = {
      maxRecords: 10,
      team: 'Frontend Cursor',
      status: null, // null means any status
      sortField: 'Date',
      sortDirection: 'desc'
    };
    
    const queryOptions = { ...defaultOptions, ...options };
    console.log('Querying Airtable for standup reports with options:', queryOptions);
    
    // Build filter formula
    let filterFormula = "";
    if (queryOptions.team) {
      filterFormula += `{Team} = "${queryOptions.team}"`;
    }
    
    if (queryOptions.status) {
      if (filterFormula) filterFormula += " AND ";
      filterFormula += `{Status} = "${queryOptions.status}"`;
    }
    
    // Build query parameters
    const queryParams = {
      tableId: AIRTABLE_CONFIG.STANDUP_TABLE_ID,
      maxRecords: queryOptions.maxRecords,
      view: AIRTABLE_CONFIG.STANDUP_VIEW_ID,
      sort: [
        { field: queryOptions.sortField, direction: queryOptions.sortDirection }
      ]
    };
    
    if (filterFormula) {
      queryParams.filterByFormula = filterFormula;
    }
    
    // Make query request
    const result = await airtableFetch('/query', {
      method: 'POST',
      body: JSON.stringify(queryParams)
    });
    
    if (!result || !result.records) {
      throw new Error('Invalid response from Airtable API');
    }
    
    // Success
    console.log(`Found ${result.records.length} standup reports`);
    
    return {
      success: true,
      records: result.records,
      count: result.records.length
    };
  } catch (error) {
    console.error('Query failed:', error);
    log('Failed to query Airtable', { error: error.message }, 'error');
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Display standup reports in the console in a user-friendly format
 * @param {Array} records - Airtable records
 */
function displayReports(records) {
  if (!records || records.length === 0) {
    console.log('No records found');
    return;
  }
  
  console.log(`----- Found ${records.length} Standup Reports -----`);
  
  records.forEach((record, index) => {
    const fields = record.fields;
    
    console.log(`\n[${index + 1}] ${fields.Title || 'Untitled Report'}`);
    console.log(`Date: ${fields.Date || 'Unknown'}`);
    console.log(`Team: ${fields.Team || 'Unknown'}`);
    console.log(`Status: ${fields.Status || 'Unknown'}`);
    console.log(`Reporter: ${fields.Reporter || 'Unknown'}`);
    
    // Show summary if available
    if (fields.Summary) {
      console.log(`\nSummary: ${fields.Summary.slice(0, 100)}${fields.Summary.length > 100 ? '...' : ''}`);
    }
    
    // Show ID and record URL
    console.log(`\nRecord ID: ${record.id}`);
  });
}

/**
 * Run a query and display results
 * @param {Object} options - Query options
 */
async function queryAndDisplay(options = {}) {
  console.log('Querying Airtable for standup reports...');
  
  const result = await queryStandupReports(options);
  
  if (result.success) {
    displayReports(result.records);
  } else {
    console.error('Query failed:', result.error);
  }
  
  return result;
}

/**
 * Publish a report and then query to confirm it exists
 * @param {string} reportPath - Path to report
 */
async function publishAndVerify(reportPath) {
  try {
    // Import publisher
    const publisher = await import('./publish-standup-report.js');
    
    // Run diagnostics
    console.log('Running diagnostics before publishing...');
    const diagnostics = await publisher.runDiagnostics();
    
    if (diagnostics.status === 'failed' || !diagnostics.authed) {
      console.warn('⚠️ Diagnostics indicate potential issues, but will try to publish anyway');
    }
    
    // Publish report
    console.log('Publishing report...');
    const publishResult = await publisher.publishWithNotification(reportPath);
    
    if (!publishResult.success) {
      throw new Error(`Failed to publish: ${publishResult.error || 'Unknown error'}`);
    }
    
    console.log('✅ Report published successfully!');
    
    // Wait a moment for Airtable to process
    console.log('Waiting for Airtable to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Query to verify
    console.log('Querying Airtable to verify report exists...');
    const queryResult = await queryStandupReports();
    
    if (queryResult.success && queryResult.records.length > 0) {
      console.log('✅ Verification successful! Found records in Airtable');
      displayReports(queryResult.records);
      return {
        success: true,
        publishResult,
        queryResult
      };
    } else {
      console.error('❌ Verification failed: Could not find published report in Airtable');
      return {
        success: false,
        publishResult,
        queryResult,
        error: 'Verification failed'
      };
    }
  } catch (error) {
    console.error('❌ Publish and verify failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export public API
export {
  queryStandupReports,
  displayReports,
  queryAndDisplay,
  publishAndVerify
};

// Add to window for console access
if (typeof window !== 'undefined') {
  window.queryStandupReports = queryAndDisplay;
  window.publishAndVerify = publishAndVerify;
  
  console.log('📊 Airtable query utility loaded');
  console.log('To query reports: queryStandupReports()');
  console.log('To publish and verify: publishAndVerify("/shared/docs/standup-reports/april-7-frontend-standup-01.mdc")');
} 