#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

function parseReportContent(content) {
    const sections = {
        priorities: [],
        findings: [],
        nextSteps: [],
        futureFeatures: []
    };

    const lines = content.split('\n');
    let currentSection = null;

    for (const line of lines) {
        if (line.startsWith('## Priorities')) {
            currentSection = 'priorities';
        } else if (line.startsWith('## Findings')) {
            currentSection = 'findings';
        } else if (line.startsWith('## Next Steps')) {
            currentSection = 'nextSteps';
        } else if (line.startsWith('## Future Features')) {
            currentSection = 'futureFeatures';
        } else if (currentSection && line.trim() && line.startsWith('- ')) {
            sections[currentSection].push(line.substring(2).trim());
        }
    }

    return sections;
}

function submitStandupReport(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const title = path.basename(filePath, '.mdc');
    const sections = parseReportContent(content);
    
    const data = JSON.stringify({
        records: [{
            fields: {
                'Report Title': title,
                'Report Date': new Date().toISOString().split('T')[0],
                'Team Name': 'Frontend Cursor',
                'Reporter Name': 'Cursor AI',
                'Report Summary': content.split('## Summary')[1]?.split('##')[0]?.trim() || 'No summary provided',
                'Current Features': sections.priorities,
                'Completed Tasks': sections.findings,
                'Next Steps': sections.nextSteps,
                'Future Integrations': sections.futureFeatures,
                'Report Tags': ['frontend_cursor'],
                'Report Status': 'Drafted',
                'Git Branch': 'main'
            }
        }]
    });

    const options = {
        hostname: 'api.airtable.com',
        path: '/v0/appqFjYLZiRlgZQDM/tblNfEQbQINXSN8C6',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseData));
                } else {
                    reject(new Error(`Failed to submit: ${responseData}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(data);
        req.end();
    });
}

// Main execution
if (require.main === module) {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Please provide a file path');
        process.exit(1);
    }

    if (!process.env.AIRTABLE_API_KEY) {
        console.error('Please set AIRTABLE_API_KEY environment variable');
        process.exit(1);
    }

    submitStandupReport(filePath)
        .then(result => {
            console.log('Report submitted successfully:', result);
        })
        .catch(error => {
            console.error('Error submitting report:', error);
            process.exit(1);
        });
} 