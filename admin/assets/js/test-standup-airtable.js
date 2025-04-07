/**
 * Test Script for Standup Report Airtable Integration
 * 
 * This script is used in the admin interface to test the 
 * bidirectional reporting system with Airtable.
 */

// Import our reporting tools
import { 
  queryAndDisplay, 
  publishAndVerify 
} from '../../shared/assets/js/airtable-query.js';

// Set up UI elements
const testUI = {
  setupTestUI() {
    // Create UI container
    const container = document.createElement('div');
    container.className = 'airtable-test-ui';
    container.style.cssText = 'padding: 20px; background: #f5f5f5; border-radius: 8px; margin: 20px 0;';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Standup Report Airtable Integration Test';
    container.appendChild(title);
    
    // Add query button
    const queryButton = document.createElement('button');
    queryButton.textContent = 'Query Existing Reports';
    queryButton.className = 'btn btn-primary';
    queryButton.style.marginRight = '10px';
    queryButton.addEventListener('click', () => this.handleQueryReports());
    container.appendChild(queryButton);
    
    // Add publish button
    const publishButton = document.createElement('button');
    publishButton.textContent = 'Publish & Verify Latest Report';
    publishButton.className = 'btn btn-success';
    publishButton.addEventListener('click', () => this.handlePublishReport());
    container.appendChild(publishButton);
    
    // Add results area
    const resultsArea = document.createElement('div');
    resultsArea.id = 'airtable-test-results';
    resultsArea.style.cssText = 'margin-top: 20px; background: #fff; padding: 15px; border-radius: 4px; border: 1px solid #ddd; min-height: 200px; max-height: 500px; overflow-y: auto;';
    resultsArea.innerHTML = '<p>Test results will appear here...</p>';
    container.appendChild(resultsArea);
    
    // Find a place to add our UI
    const targetElement = document.querySelector('#admin-content') || document.body;
    targetElement.appendChild(container);
    
    this.resultsArea = resultsArea;
    console.log('Airtable test UI initialized');
  },
  
  async handleQueryReports() {
    this.updateResults('Querying Airtable for standup reports...');
    
    try {
      const options = {
        maxRecords: 10,
        team: 'Frontend Cursor' 
      };
      
      const result = await queryAndDisplay(options);
      
      if (result.success) {
        this.updateResults(this.formatReportResults(result.records), true);
      } else {
        this.updateResults(`Query failed: ${result.error}`, true);
      }
    } catch (error) {
      this.updateResults(`Error: ${error.message}`, true);
    }
  },
  
  async handlePublishReport() {
    this.updateResults('Starting publish and verify workflow...');
    
    try {
      const reportPath = '/shared/docs/standup-reports/april-7-frontend-standup-01.mdc';
      
      this.updateResults('Publishing report and verifying in Airtable...');
      const result = await publishAndVerify(reportPath);
      
      if (result.success) {
        this.updateResults('✅ Report published and verified in Airtable!', true);
        this.updateResults(this.formatReportResults(result.queryResult.records), false);
      } else {
        this.updateResults(`❌ Publish workflow failed: ${result.error || 'Unknown error'}`, true);
      }
    } catch (error) {
      this.updateResults(`Error: ${error.message}`, true);
    }
  },
  
  updateResults(html, replace = true) {
    if (!this.resultsArea) return;
    
    if (replace) {
      this.resultsArea.innerHTML = html;
    } else {
      this.resultsArea.innerHTML += html;
    }
  },
  
  formatReportResults(records) {
    if (!records || records.length === 0) {
      return '<p>No records found</p>';
    }
    
    let html = `<h4>Found ${records.length} Standup Reports</h4>`;
    
    records.forEach((record, index) => {
      const fields = record.fields;
      
      html += `
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-left: 4px solid #007bff;">
          <h5>${fields.Title || 'Untitled Report'}</h5>
          <p><strong>Date:</strong> ${fields.Date || 'Unknown'}</p>
          <p><strong>Team:</strong> ${fields.Team || 'Unknown'}</p>
          <p><strong>Status:</strong> <span style="background: ${this.getStatusColor(fields.Status)}; padding: 2px 6px; border-radius: 3px;">${fields.Status || 'Unknown'}</span></p>
          <p><strong>Reporter:</strong> ${fields.Reporter || 'Unknown'}</p>
          
          ${fields.Summary ? `<p><strong>Summary:</strong> ${fields.Summary.slice(0, 100)}${fields.Summary.length > 100 ? '...' : ''}</p>` : ''}
          
          <p><strong>Record ID:</strong> ${record.id}</p>
        </div>
      `;
    });
    
    return html;
  },
  
  getStatusColor(status) {
    switch (status) {
      case 'Completed': return '#28a745';
      case 'Drafted': return '#ffc107';
      case 'In Progress': return '#17a2b8';
      case 'Blocked': return '#dc3545';
      default: return '#6c757d';
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Airtable test interface...');
  testUI.setupTestUI();
});

// Export for console access
window.testAirtableStandup = {
  queryReports: () => testUI.handleQueryReports(),
  publishReport: () => testUI.handlePublishReport()
};

console.log('Airtable standup test script loaded');
console.log('Access via console: testAirtableStandup.queryReports() or testAirtableStandup.publishReport()'); 