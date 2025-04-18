const { SignatureV4 } = require('@aws-sdk/signature-v4');
const { Sha256 } = require('@aws-crypto/sha256-browser');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const { HttpRequest } = require('@aws-sdk/protocol-http');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');

async function testSignedRequest() {
    const region = 'us-east-2';
    const service = 'execute-api';
    
    // Create the HTTP request
    const request = new HttpRequest({
        hostname: '29wtfiieig.execute-api.us-east-2.amazonaws.com',
        path: '/dev/api/v1/mock',
        protocol: 'https:',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.MERIT_API_KEY,
            'X-Project-ID': process.env.OPENAI_PROJECT_ID,
            host: '29wtfiieig.execute-api.us-east-2.amazonaws.com'
        }
    });

    // Create the signature
    const signer = new SignatureV4({
        credentials: defaultProvider(),
        region: region,
        service: service,
        sha256: Sha256
    });

    try {
        // Sign the request
        const signedRequest = await signer.sign(request);
        console.log('Signed Request Headers:', signedRequest.headers);

        // Make the request
        const client = new NodeHttpHandler();
        const { response } = await client.handle(signedRequest);
        
        // Read the response
        const chunks = [];
        for await (const chunk of response.body) {
            chunks.push(chunk);
        }
        const responseBody = Buffer.concat(chunks).toString();
        
        console.log('Response Status:', response.statusCode);
        console.log('Response Body:', responseBody);
    } catch (error) {
        console.error('Error:', error);
    }
}

testSignedRequest(); 