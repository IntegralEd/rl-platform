/**
 * Standup Report Publisher for Recursive Learning Platform
 * 
 * Handles formatting and publishing standup reports to the shared Airtable
 * and facilitates team communication via Slack.
 */

import { secureFetch } from './api-client.js';
import { log } from './cloudwatch-integration.js';

// Configuration
const PUBLISHER_CONFIG = {
  AIRTABLE_API_ENDPOINT: '/api/v1/airtable',
  STANDUP_TABLE_ID: 'tblNfEQbQINXSN8C6',
  STANDUP_VIEW_ID: 'viwIwhW0J7LWD4wNo',
  FRONTEND_CURSOR_TAG: 'frontend_cursor',
  BACKEND_CURSOR_TAG: 'backend_cursor',
  TEAM_SLACK_WEBHOOK: '/api/v1/slack/standup-webhook'
};

/**
 * Format a standup report for Airtable
 * @param {Object} report - Standup report data
 * @param {string} status - Report status ('Drafted', 'Completed', 'In Progress')
 * @returns {Object} Formatted Airtable record
 */
function formatReportForAirtable(report, status = 'Drafted') {
  // Create a default title with date and version if not provided
  const defaultDate = report.date || new Date().toISOString().split('T')[0];
  const defaultVersion = report.reportNumber || 1;
  const defaultTitle = `Front End Standup ${defaultDate} v${String(defaultVersion).padStart(2, '0')}`;
  
  return {
    fields: {
      Title: report.title || defaultTitle,
      Date: report.date || new Date().toISOString().split('T')[0],
      Team: 'Frontend Cursor', 
      Reporter: report.reporter || 'Cursor AI',
      Summary: report.summary || '',
      Status: status,
      'Current Features': report.currentFeatures || [],
      'Completed Tasks': report.completedTasks || [],
      'Test Results': report.testResults || [],
      'Challenges': report.challenges || [],
      'Next Steps': report.nextSteps || [],
      'Future Integrations': report.futureIntegrations || [],
      'CTO Review': report.ctoReview || '',
      'Report Number': report.reportNumber || 1,
      'Branch': report.branch || 'backend-integration',
      Tags: [PUBLISHER_CONFIG.FRONTEND_CURSOR_TAG]
    }
  };
}

/**
 * Parse an MDC standup report into structured data
 * @param {string} mdcContent - Content of MDC standup report file
 * @returns {Object} Structured report data
 */
function parseStandupReportMdc(mdcContent) {
  if (!mdcContent) return {};
  
  // Initialize report object
  const report = {
    title: '',
    summary: '',
    currentFeatures: [],
    completedTasks: [],
    testResults: [],
    challenges: [],
    nextSteps: [],
    futureIntegrations: [],
    ctoReview: '',
    reportNumber: 1
  };
  
  // Extract title
  const titleMatch = mdcContent.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    report.title = titleMatch[1].trim();
    
    // Try to extract report number if present
    const numberMatch = report.title.match(/(\d+)$/);
    if (numberMatch) {
      report.reportNumber = parseInt(numberMatch[1], 10);
    }
  }
  
  // Extract summary
  const summarySection = extractSection(mdcContent, 'Summary');
  if (summarySection) {
    report.summary = summarySection.trim();
  }
  
  // Extract current features
  report.currentFeatures = extractListItems(mdcContent, 'Current Build Features');
  
  // Extract completed tasks
  report.completedTasks = extractListItems(mdcContent, 'Completed Tasks');
  
  // Extract test results
  report.testResults = extractTestResults(mdcContent);
  
  // Extract challenges
  report.challenges = extractChallenges(mdcContent);
  
  // Extract next steps
  report.nextSteps = extractListItems(mdcContent, 'Next Steps');
  
  // Extract future integrations
  report.futureIntegrations = extractListItems(mdcContent, 'Future Integrations');
  
  // Extract CTO review
  const ctoReviewSection = extractSection(mdcContent, 'CTO Review Notes');
  if (ctoReviewSection) {
    report.ctoReview = ctoReviewSection.trim();
  }
  
  // Extract date from file content or title
  const dateMatch = mdcContent.match(/april-(\d+)/i) || report.title.match(/april (\d+)/i);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    report.date = `2023-04-${day}`;
  } else {
    report.date = new Date().toISOString().split('T')[0];
  }
  
  return report;
}

/**
 * Extract a section from MDC content
 * @param {string} mdcContent - MDC content
 * @param {string} sectionName - Name of section to extract
 * @returns {string|null} Section content or null if not found
 */
function extractSection(mdcContent, sectionName) {
  const sectionRegex = new RegExp(`##\\s+${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i');
  const match = mdcContent.match(sectionRegex);
  return match ? match[1].trim() : null;
}

/**
 * Extract list items from a section
 * @param {string} mdcContent - MDC content
 * @param {string} sectionName - Name of section to extract items from
 * @returns {Array<string>} List items
 */
function extractListItems(mdcContent, sectionName) {
  const section = extractSection(mdcContent, sectionName);
  if (!section) return [];
  
  const items = [];
  const lines = section.split('\n');
  
  // Process subsections and list items
  let currentSubsection = '';
  
  for (const line of lines) {
    // Check for subsection
    const subsectionMatch = line.match(/^###\s+(.+)$/);
    if (subsectionMatch) {
      currentSubsection = subsectionMatch[1].trim();
      continue;
    }
    
    // Check for list item
    const listItemMatch = line.match(/^-\s+(.+)$/);
    if (listItemMatch) {
      const item = listItemMatch[1].trim();
      if (currentSubsection) {
        items.push(`${currentSubsection}: ${item}`);
      } else {
        items.push(item);
      }
    }
  }
  
  return items;
}

/**
 * Extract test results from standup report
 * @param {string} mdcContent - MDC content
 * @returns {Array<string>} Test results
 */
function extractTestResults(mdcContent) {
  const section = extractSection(mdcContent, 'Test Results');
  if (!section) return [];
  
  const results = [];
  const testCases = section.split(/###\s+Test Case:/);
  
  // Skip the first entry if it's empty
  for (let i = 1; i < testCases.length; i++) {
    const testCase = testCases[i].trim();
    if (!testCase) continue;
    
    // Extract test name
    const nameMatch = testCase.match(/^([^-\n]+)/);
    const name = nameMatch ? nameMatch[1].trim() : 'Unknown Test';
    
    // Extract hypothesis
    const hypothesisMatch = testCase.match(/\*\*Hypothesis\*\*:\s+([^\n]+)/);
    const hypothesis = hypothesisMatch ? hypothesisMatch[1].trim() : '';
    
    // Extract result
    const resultMatch = testCase.match(/\*\*Result\*\*:\s+([^\n]+)/);
    const result = resultMatch ? resultMatch[1].trim() : '';
    
    // Format test result
    results.push(`${name} - ${result}${hypothesis ? ` (${hypothesis})` : ''}`);
  }
  
  return results;
}

/**
 * Extract challenges and solutions from standup report
 * @param {string} mdcContent - MDC content
 * @returns {Array<string>} Challenges and solutions
 */
function extractChallenges(mdcContent) {
  const section = extractSection(mdcContent, 'Challenges & Solutions');
  if (!section) return [];
  
  const challenges = [];
  const challengeBlocks = section.split(/###\s+Challenge \d+:/);
  
  // Skip the first entry if it's empty
  for (let i = 1; i < challengeBlocks.length; i++) {
    const block = challengeBlocks[i].trim();
    if (!block) continue;
    
    // Extract challenge description (first line)
    const descriptionMatch = block.match(/^([^\n]+)/);
    const description = descriptionMatch ? descriptionMatch[1].trim() : 'Unknown Challenge';
    
    // Extract solution summary
    const solutionMatch = block.match(/\*\*Solution\*\*:([^]*?)(?=\d+\.|$)/s);
    let solution = '';
    
    if (solutionMatch) {
      // Extract top-level solution points
      const solutionText = solutionMatch[1].trim();
      const points = solutionText.match(/\d+\.\s+([^\n]+)/g) || [];
      
      if (points.length > 0) {
        solution = ' Solution: ' + points.map(p => p.trim()).join('; ');
      }
    }
    
    challenges.push(`${description}${solution}`);
  }
  
  return challenges;
}

/**
 * Publish standup report to Airtable
 * @param {string} mdcFilePath - Path to MDC file
 * @param {string} status - Report status ('Drafted', 'Completed', 'In Progress')
 * @returns {Promise<Object>} Result of publishing
 */
async function publishToAirtable(mdcFilePath, status = 'Drafted') {
  try {
    // Fetch MDC file content
    const response = await fetch(mdcFilePath);
    const mdcContent = await response.text();
    
    // Parse MDC content
    const reportData = parseStandupReportMdc(mdcContent);
    
    // Format for Airtable
    const airtableRecord = formatReportForAirtable(reportData, status);
    
    // Send to Airtable
    const result = await secureFetch(`${PUBLISHER_CONFIG.AIRTABLE_API_ENDPOINT}/records`, {
      method: 'POST',
      body: JSON.stringify({
        tableId: PUBLISHER_CONFIG.STANDUP_TABLE_ID,
        records: [airtableRecord]
      })
    });
    
    log('Standup report published to Airtable', { reportTitle: reportData.title, status }, 'info');
    
    return {
      success: true,
      recordId: result.records[0].id,
      report: reportData
    };
  } catch (error) {
    console.error('Failed to publish standup report:', error);
    log('Failed to publish standup report', { error: error.message, path: mdcFilePath }, 'error');
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update report status in Airtable
 * @param {string} recordId - Airtable record ID
 * @param {string} status - New status ('Drafted', 'Completed', 'In Progress')
 * @returns {Promise<Object>} Result of update
 */
async function updateReportStatus(recordId, status = 'Completed') {
  try {
    const result = await secureFetch(`${PUBLISHER_CONFIG.AIRTABLE_API_ENDPOINT}/records/${recordId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        tableId: PUBLISHER_CONFIG.STANDUP_TABLE_ID,
        fields: {
          Status: status
        }
      })
    });
    
    log('Standup report status updated', { recordId, status }, 'info');
    
    return {
      success: true,
      recordId: result.id
    };
  } catch (error) {
    console.error('Failed to update report status:', error);
    log('Failed to update report status', { error: error.message, recordId }, 'error');
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Publish latest standup report to Slack
 * @param {Object} report - Report data (from parseStandupReportMdc)
 * @param {string} recordId - Airtable record ID (if available, to update status)
 * @returns {Promise<Object>} Result of publishing
 */
async function publishToSlack(report, recordId = null) {
  try {
    // Format for Slack
    const slackMessage = formatReportForSlack(report);
    
    // Send to Slack webhook
    const result = await secureFetch(PUBLISHER_CONFIG.TEAM_SLACK_WEBHOOK, {
      method: 'POST',
      body: JSON.stringify(slackMessage)
    });
    
    log('Standup report published to Slack', { reportTitle: report.title }, 'info');
    
    // Update status in Airtable if record ID is provided
    if (recordId) {
      await updateReportStatus(recordId, 'Completed');
    }
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Failed to publish standup report to Slack:', error);
    log('Failed to publish standup report to Slack', { error: error.message }, 'error');
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Format report for Slack message
 * @param {Object} report - Report data
 * @returns {Object} Slack message payload
 */
function formatReportForSlack(report) {
  // Create Slack blocks for the message
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: report.title,
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Team:* Frontend Cursor\n*Date:* ${report.date}\n*Report #:* ${report.reportNumber}`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Summary:*\n${report.summary}`
      }
    }
  ];
  
  // Add current features if available
  if (report.currentFeatures.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Current Features:*\n• ${report.currentFeatures.join('\n• ')}`
      }
    });
  }
  
  // Add completed tasks if available
  if (report.completedTasks.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Completed Tasks:*\n• ${report.completedTasks.join('\n• ')}`
      }
    });
  }
  
  // Add test results if available
  if (report.testResults.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Test Results:*\n• ${report.testResults.join('\n• ')}`
      }
    });
  }
  
  // Add next steps if available
  if (report.nextSteps.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Next Steps:*\n• ${report.nextSteps.join('\n• ')}`
      }
    });
  }
  
  // Add Airtable link
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `<https://airtable.com/appqFjYLZiRlgZQDM/${PUBLISHER_CONFIG.STANDUP_TABLE_ID}/${PUBLISHER_CONFIG.STANDUP_VIEW_ID}?blocks=hide|View all standup reports in Airtable>`
    }
  });
  
  return {
    blocks
  };
}

/**
 * Load standup report from file
 * @param {string} filePath - Path to standup report file
 * @returns {Promise<Object>} Parsed standup report
 */
async function loadStandupReport(filePath) {
  try {
    const response = await fetch(filePath);
    const mdcContent = await response.text();
    return parseStandupReportMdc(mdcContent);
  } catch (error) {
    console.error('Failed to load standup report:', error);
    throw error;
  }
}

/**
 * Find all standup reports in a directory
 * @param {string} directoryPath - Path to directory
 * @returns {Promise<Array<string>>} Array of file paths
 */
async function findStandupReports(directoryPath) {
  try {
    const response = await secureFetch(`/api/v1/files/list`, {
      method: 'POST',
      body: JSON.stringify({ path: directoryPath })
    });
    
    // Filter for standup report files
    const standupFiles = response.files.filter(file => 
      file.name.includes('standup') && file.name.endsWith('.mdc')
    );
    
    return standupFiles.map(file => `${directoryPath}/${file.name}`);
  } catch (error) {
    console.error('Failed to find standup reports:', error);
    return [];
  }
}

/**
 * Complete workflow to publish standup report to Airtable and then Slack
 * @param {string} mdcFilePath - Path to MDC file
 * @returns {Promise<Object>} Result of publishing
 */
async function publishStandupWorkflow(mdcFilePath) {
  try {
    // First publish to Airtable as "Drafted"
    const airtableResult = await publishToAirtable(mdcFilePath, 'Drafted');
    
    if (!airtableResult.success) {
      return {
        success: false,
        stage: 'airtable',
        error: airtableResult.error
      };
    }
    
    // Then publish to Slack and update status
    const slackResult = await publishToSlack(airtableResult.report, airtableResult.recordId);
    
    return {
      success: slackResult.success,
      stage: 'completed',
      airtableRecordId: airtableResult.recordId,
      report: airtableResult.report
    };
  } catch (error) {
    console.error('Failed to complete standup workflow:', error);
    return {
      success: false,
      stage: 'workflow',
      error: error.message
    };
  }
}

// Export public API
export {
  publishToAirtable,
  publishToSlack,
  updateReportStatus,
  loadStandupReport,
  findStandupReports,
  parseStandupReportMdc,
  formatReportForAirtable,
  publishStandupWorkflow
}; 