// Test /en route directly
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/en',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`BODY LENGTH: ${data.length}`);
    if (data.length > 0) {
      console.log('✅ /en route is working!');
      console.log(`BODY PREVIEW: ${data.substring(0, 200)}`);
    } else {
      console.log('❌ /en route returns empty body');
    }
  });
});

req.on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
});

req.end();
