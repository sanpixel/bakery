const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const OpenAI = require('openai');

// Load OpenAI API key from environment variable or local file
let OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  try {
    const openaiConfig = JSON.parse(fs.readFileSync('C:\\dev\\openai-key.json', 'utf8'));
    OPENAI_API_KEY = openaiConfig.OPENAI_API_KEY;
    console.log('✅ OpenAI API key loaded from C:\\dev\\openai-key.json');
  } catch (error) {
    console.log('❌ OpenAI key not found in environment variable or local file');
  }
} else {
  console.log('✅ OpenAI API key loaded from environment variable');
}

// Initialize OpenAI client
let openai = null;
if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY
  });
}

// Table names based on repo/app name
const APP_NAME = path.basename(process.cwd()).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
const TODO_TABLE = `${APP_NAME}_todo_items`;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Database initialization
async function initDatabase() {
  try {
    // Create TODO items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${TODO_TABLE} (
        id SERIAL PRIMARY KEY,
        item_number INTEGER NOT NULL,
        description TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created TIMESTAMP DEFAULT NOW(),
        modified TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

initDatabase();

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

// TODO CRUD endpoints
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${TODO_TABLE} ORDER BY item_number`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const { description } = req.body;
    const countResult = await pool.query(`SELECT COUNT(*) FROM ${TODO_TABLE}`);
    const itemNumber = parseInt(countResult.rows[0].count) + 1;
    
    const result = await pool.query(
      `INSERT INTO ${TODO_TABLE} (item_number, description) VALUES ($1, $2) RETURNING *`,
      [itemNumber, description]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, completed } = req.body;
    
    const result = await pool.query(
      `UPDATE ${TODO_TABLE} SET description = $1, completed = $2, modified = NOW() WHERE id = $3 RETURNING *`,
      [description, completed, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic query based on provided fields
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE ${TODO_TABLE} SET ${setClause}, modified = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM ${TODO_TABLE} WHERE id = $1`, [id]);
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OpenAI chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!openai) {
      return res.status(500).json({ error: 'OpenAI not configured' });
    }
    
    console.log('Processing message:', message);
    
    // Read prompt from file
    const promptPath = path.join(__dirname, 'prompt.txt');
    let systemPrompt = "Summarize the user input like Shakespeare. Return a single line so that can be added to the todo list.";
    
    try {
      systemPrompt = fs.readFileSync(promptPath, 'utf8').trim();
      console.log('Using prompt from file:', systemPrompt);
    } catch (error) {
      console.log('Using default prompt, file not found:', error.message);
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.3
    });
    
    const response = completion.choices[0].message.content;
    console.log('OpenAI response:', response);
    
    // Create a single todo from the Shakespeare response
    const countResult = await pool.query(`SELECT COUNT(*) FROM ${TODO_TABLE}`);
    const itemNumber = parseInt(countResult.rows[0].count) + 1;
    
    const result = await pool.query(
      `INSERT INTO ${TODO_TABLE} (item_number, description) VALUES ($1, $2) RETURNING *`,
      [itemNumber, response]
    );
    
    res.json({ aiResponse: `Created: "${response}"`, todos: [result.rows[0]] });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error.message, aiResponse: 'Error processing your request' });
  }
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});