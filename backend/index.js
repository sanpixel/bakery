const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Load OpenAI API key
let OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  try {
    const config = JSON.parse(fs.readFileSync('C:\\dev\\openai-key.json', 'utf8'));
    OPENAI_API_KEY = config.OPENAI_API_KEY;
  } catch (error) {
    console.log('OpenAI key not found');
  }
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Dynamic table names from repo name
let APP_NAME = 'app'; // fallback
try {
  const { execSync } = require('child_process');
  const repoUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
  APP_NAME = repoUrl.split('/').pop().replace(/\.git$/, '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
} catch (error) {
  console.log('Could not get repo name, using fallback');
}
const TODO_TABLE = `${APP_NAME}_todo_items`;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize database
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${TODO_TABLE} (
        id SERIAL PRIMARY KEY,
        item_number INTEGER,
        description TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}
initDatabase();

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

app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${TODO_TABLE} ORDER BY item_number ASC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const { description } = req.body;
    
    // Get next item number by counting existing todos + 1
    const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${TODO_TABLE}`);
    const itemNumber = parseInt(countResult.rows[0].count) + 1;
    
    const result = await pool.query(
      `INSERT INTO ${TODO_TABLE} (description, item_number) VALUES ($1, $2) RETURNING *`,
      [description, itemNumber]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, description } = req.body;
    
    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (completed !== undefined) {
      updates.push(`completed = $${paramCount}`);
      values.push(completed);
      paramCount++;
    }
    
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    values.push(id);
    const result = await pool.query(
      `UPDATE ${TODO_TABLE} SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  if (!openai) {
    return res.status(500).json({ error: 'OpenAI not configured' });
  }

  try {
    const { message } = req.body;
    
    let systemPrompt = 'Summarize the user input like Shakespeare. Return a single line for a todo list.';
    try {
      systemPrompt = fs.readFileSync('backend/prompt.txt', 'utf8').trim();
    } catch (error) {
      console.log('Using default prompt');
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    const description = completion.choices[0].message.content.trim();
    
    // Get next item number by counting existing todos + 1
    const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${TODO_TABLE}`);
    const itemNumber = parseInt(countResult.rows[0].count) + 1;
    
    const result = await pool.query(
      `INSERT INTO ${TODO_TABLE} (description, item_number) VALUES ($1, $2) RETURNING *`,
      [description, itemNumber]
    );

    res.json({ 
      aiResponse: description,
      todo: result.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});