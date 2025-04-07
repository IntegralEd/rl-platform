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
        if (line.startsWith('## Current Build Features')) {
            currentSection = 'priorities';
        } else if (line.startsWith('## Completed Tasks')) {
            currentSection = 'findings';
        } else if (line.startsWith('## Next Steps')) {
            currentSection = 'nextSteps';
        } else if (line.startsWith('## Future Integrations')) {
            currentSection = 'futureFeatures';
        } else if (line.startsWith('##') && currentSection) {
            currentSection = null;
        } else if (currentSection && line.trim().startsWith('-')) {
            sections[currentSection].push(line.trim().substring(1).trim());
        }
    }

    return sections;
}

function publishToAirtable(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const title = path.basename(filePath, '.mdc');
    const sections = parseReportContent(content);
    
    const data = JSON.stringify({
        tableId: 'tblNfEQbQINXSN8C6',
        records: [{
            fields: {
                Title: title,
                Date: new Date().toISOString().split('T')[0],
                Team: 'Frontend Cursor',
                Reporter: 'Cursor AI',
                Summary: content.split('## Summary')[1]?.split('##')[0]?.trim() || 'No summary provided',
                'Current Features': sections.priorities,
                'Completed Tasks': sections.findings,
                'Next Steps': sections.nextSteps,
                'Future Integrations': sections.futureFeatures,
                Tags: ['frontend_cursor'],
                Status: 'Drafted',
                Branch: 'main'
            }
        }]
    });

    const options = {
        hostname: 'recursivelearning.app',
        path: '/api/v1/airtable/web-button/records',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'X-Team': 'frontend',
            'X-Airtable-Access': 'standup-reports',
            'X-Resource-Type': 'standup',
            'X-Web-Button': 'true'
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
                    reject(new Error(`Failed to publish: ${responseData}`));
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

const filePath = process.argv[2];
if (!filePath) {
    console.error('Please provide a file path');
    process.exit(1);
}

publishToAirtable(filePath)
    .then(result => {
        console.log('Successfully published to Airtable:', result);
    })
    .catch(error => {
        console.error('Error publishing to Airtable:', error);
        process.exit(1);
    }); 