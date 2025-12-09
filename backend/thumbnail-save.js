// Minimal backend endpoint to save template thumbnails
import fs from 'fs';
import path from 'path';

export default async function(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const { templateId, base64 } = JSON.parse(body);
      if (!templateId || !base64) throw new Error('Missing data');
      // Remove data URL prefix
      const base64Data = base64.replace(/^data:image\/png;base64,/, '');
      const filePath = path.join(process.cwd(), 'assets', 'template-thumbnails', `${templateId}.png`);
      fs.writeFileSync(filePath, base64Data, 'base64');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}
