const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'bakery', port: PORT });
});

// Config endpoint for frontend to get Supabase settings at runtime
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    siteUrl: process.env.SITE_URL || `http://localhost:3000`,
    deployUrl: process.env.SITE_URL
  });
});

// File browser endpoint for container debugging
app.get('/files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const listFiles = (dir, prefix = '') => {
    try {
      const items = fs.readdirSync(dir);
      let html = '';
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(prefix, item);
        
        try {
          const stats = fs.statSync(fullPath);
          if (stats.isDirectory()) {
            html += `<div style="margin: 5px 0; padding: 5px; background: #f0f0f0;">📁 ${item}/</div>`;
          } else {
            const size = (stats.size / 1024).toFixed(1);
            html += `<div style="margin: 2px 0;">📄 ${item} (${size}kb)</div>`;
          }
        } catch (e) {
          html += `<div style="margin: 2px 0; color: red;">❌ ${item} (access denied)</div>`;
        }
      });
      
      return html;
    } catch (e) {
      return `<div style="color: red;">Error reading directory: ${e.message}</div>`;
    }
  };
  
  const html = `
    <html>
      <head><title>Container Files</title></head>
      <body style="font-family: monospace; padding: 20px;">
        <h2>Container File Browser</h2>
        <h3>Root Directory (/)</h3>
        ${listFiles('/')}
        <h3>App Directory (/app)</h3>
        ${listFiles('/app')}
        <h3>Environment Variables</h3>
        <pre>${JSON.stringify(process.env, null, 2)}</pre>
      </body>
    </html>
  `;
  
  res.send(html);
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});