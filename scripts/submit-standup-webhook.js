#!/usr/bin/env node

/**
 * Frontend Standup Report Webhook Submitter
 * 
 * A command-line tool to submit standup reports via webhook
 * following the standardized format.
 * 
 * Usage: node submit-standup-webhook.js <parameters>
 * 
 * Examples:
 *   Basic:    node submit-standup-webhook.js --developer "Jane Smith" --findings "Fixed bug" 
 *   Complete: node submit-standup-webhook.js --developer "Jane Smith" --findings "Fixed bug" --priority "Implement feature" --next "Create tests" --future "Dark mode"
 *   From file: node submit-standup-webhook.js --file ./my-report.json
 * 
 * Updated: April 12, 2025
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Configuration
const WEBHOOK_URL = 'https://hook.us1.make.com/2p4n1yv1urc4upm9xlkiy459t1yd87fj';
const FRONTEND_SOURCE = 'Frontend_Cursor';

// Helper functions
function getCurrentTimestamp() {
  return new Date().toISOString();
}

function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return {
    dateStr: `${year}-${month}-${day}`,
    year,
    month,
    day
  };
}

function parseReportFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Determine if it's JSON or Markdown
    if (filePath.endsWith('.json')) {
      return JSON.parse(content);
    } else {
      // Parse markdown into report format
      const sections = {
        developer: null,
        source: 'frontend/main/feature',
        findings: [],
        priorities: [],
        nextSteps: [],
        futureFeatures: []
      };
      
      const lines = content.split('\n');
      let currentSection = null;
      
      for (const line of lines) {
        if (line.includes('User_ID:')) {
          sections.developer = line.split('User_ID:')[1].trim();
        } else if (line.includes('Report_Source:')) {
          sections.source = line.split('Report_Source:')[1].trim();
        } else if (line.startsWith('## Findings')) {
          currentSection = 'findings';
        } else if (line.startsWith('## Priorities')) {
          currentSection = 'priorities';
        } else if (line.startsWith('## Next Steps')) {
          currentSection = 'nextSteps';
        } else if (line.startsWith('## Future Feature')) {
          currentSection = 'futureFeatures';
        } else if (line.startsWith('##')) {
          currentSection = null;
        } else if (currentSection && line.trim().startsWith('-')) {
          sections[currentSection].push(line.substring(line.indexOf('-') + 1).trim());
        } else if (currentSection && line.trim().match(/^\d+\./)) {
          sections[currentSection].push(line.substring(line.indexOf('.') + 1).trim());
        }
      }
      
      return sections;
    }
  } catch (error) {
    console.error(`Error parsing file: ${error.message}`);
    process.exit(1);
  }
}

function createReport(options) {
  // Generate timestamp and ID
  const { dateStr, year, month, day } = getFormattedDate();
  const version = options.version || 1;
  const versionStr = `${year}.${month}.${day}.${version}`;
  const reportId = `${dateStr}-001`; // For a real implementation, this would use sequential IDs
  
  // Get source from options or use default
  const source = options.source || 'frontend/main/feature';
  
  // Create combined title with all three components for easy mapping
  const title = `${source} | ${dateStr} | ${versionStr}`;
  
  // Convert arrays
  const findings = Array.isArray(options.findings) ? options.findings : [options.findings];
  const priorities = Array.isArray(options.priorities) ? options.priorities : (options.priorities ? [options.priorities] : ['Complete current tasks']);
  const nextSteps = Array.isArray(options.nextSteps) ? options.nextSteps : (options.nextSteps ? [options.nextSteps] : ['Continue development']);
  const futureFeatures = Array.isArray(options.futureFeatures) ? options.futureFeatures : (options.futureFeatures ? [options.futureFeatures] : ['Improve user experience']);
  
  return {
    Title: title,
    ID: reportId,
    Created: getCurrentTimestamp(),
    Source: source,
    Date: dateStr,
    Version: versionStr,
    Findings: findings,
    Priorities: priorities,
    Next_Steps: nextSteps,
    Future_Features: futureFeatures
  };
}

function submitReport(report) {
  const reportJson = JSON.stringify(report, null, 2);
  console.log('Submitting report:\n', reportJson);
  
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(reportJson)
      }
    };
    
    const req = https.request(WEBHOOK_URL, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            success: true,
            status: res.statusCode,
            response: responseData
          });
        } else {
          reject(new Error(`Webhook returned status ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(reportJson);
    req.end();
  });
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--file' || arg === '-f') {
      options.file = args[++i];
    } else if (arg === '--developer' || arg === '-d') {
      options.developer = args[++i];
    } else if (arg === '--source' || arg === '-s') {
      options.source = args[++i];
    } else if (arg === '--findings' || arg === '-F') {
      options.findings = args[++i];
    } else if (arg === '--priority' || arg === '-p') {
      options.priorities = args[++i];
    } else if (arg === '--next' || arg === '-n') {
      options.nextSteps = args[++i];
    } else if (arg === '--future' || arg === '-u') {
      options.futureFeatures = args[++i];
    } else if (arg === '--version' || arg === '-v') {
      options.version = parseInt(args[++i]);
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }
  
  return options;
}

function showHelp() {
  console.log(`
Frontend Standup Report Webhook Submitter

Usage: node submit-standup-webhook.js [options]

Options:
  --file, -f        Path to a JSON or Markdown report file
  --developer, -d   Developer name
  --source, -s      Report source (format: repo/branch/feature)
  --findings, -F    Completed work (required if not using --file)
  --priority, -p    Current priority
  --next, -n        Next steps
  --future, -u      Future features
  --version, -v     Report version (default: 1)
  --help, -h        Show this help

Examples:
  node submit-standup-webhook.js --developer "Jane Smith" --source "frontend/main/auth" --findings "Fixed navbar bug"
  node submit-standup-webhook.js --file ./my-report.json
  node submit-standup-webhook.js --file ./my-report.md
  `);
}

// Main execution
async function main() {
  try {
    const options = parseArgs();
    
    if (options.help) {
      showHelp();
      return;
    }
    
    let reportData;
    
    if (options.file) {
      console.log(`Reading report from file: ${options.file}`);
      const fileOptions = parseReportFile(options.file);
      reportData = createReport(fileOptions);
    } else {
      // Validate required fields
      if (!options.developer) {
        console.error('Error: Developer name is required. Use --developer or --file option.');
        showHelp();
        process.exit(1);
      }
      
      if (!options.findings) {
        console.error('Error: Findings are required. Use --findings or --file option.');
        showHelp();
        process.exit(1);
      }
      
      reportData = createReport(options);
    }
    
    // Submit the report
    const result = await submitReport(reportData);
    
    console.log(`Report submitted successfully!`);
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${result.response}`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main(); 