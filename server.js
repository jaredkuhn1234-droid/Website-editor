import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { publishSite } from './backend/publish.js';

const PORT = process.env.PORT || 4003;

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle POST /publish (new endpoint for frontend)
  if (req.method === 'POST' && (req.url === '/publish' || req.url === '/api/publish')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { siteId } = data;
        if (!siteId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'siteId is required' }));
          return;
        }
        console.log(`[Publish] Starting for siteId: ${siteId}`);
        const result = await publishSite(siteId);
        console.log(`[Publish] Success: ${result.siteUrl}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, siteUrl: result.siteUrl, deployId: result.deployId }));
      } catch (error) {
        console.error(`[Publish] Error: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  }
  // Handle POST /api/thumbnail-save for template thumbnail saving
  else if (req.method === 'POST' && req.url === '/api/thumbnail-save') {
    import('./backend/thumbnail-save.js').then(mod => {
      mod.default(req, res);
    });
  }
  // Handle HEAD/GET for /assets/template-thumbnails/<id>.png
  else if ((req.method === 'HEAD' || req.method === 'GET') && req.url.startsWith('/assets/template-thumbnails/')) {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), req.url.replace(/\//g, path.sep));
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      if (req.method === 'GET') {
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.end();
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('Not found');
    }
  }
  // Respond to HEAD for /api/thumbnail-save with 200 OK (for existence check)
  else if (req.method === 'HEAD' && req.url === '/api/thumbnail-save') {
    res.writeHead(200);
    res.end();
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`Unhandled Rejection: ${reason}`);
});

// Keep the process alive indefinitely
setInterval(() => {}, 1000);
