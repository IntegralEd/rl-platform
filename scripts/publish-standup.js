#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'appqFjYLZiRlgZQDM';
const AIRTABLE_TABLE_ID = 'tblNfEQbQINXSN8C6';

function publishToAirtable(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const title = path.basename(filePath, '.mdc');
    
    const data = JSON.stringify({
        records: [{
            fields: {
                Title: title,
                Status: 'Drafted',
                Team: 'Frontend Cursor',
                Tags: ['frontend_cursor'],
                Content: content
            }
        }]
    });

    const options = {
        hostname: 'api.airtable.com',
        path: `/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
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

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
    console.error('Please provide a file path');
    process.exit(1);
}

if (!AIRTABLE_API_KEY) {
    console.error('AIRTABLE_API_KEY environment variable is required');
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