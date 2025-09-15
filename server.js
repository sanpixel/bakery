const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { Pool } = require('pg');
const OpenAI = require('openai');

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
const APP_NAME = path.basename(process.cwd()).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
const TODO_TABLE = `${APP_NAME}_todo_items`;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('build'));

// Initialize database
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${TODO_TABLE} (
        id SERIAL PRIMARY KEY,
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

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', table: TODO_TABLE });
});

app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${TODO_TABLE} ORDER BY created DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const { description } = req.body;
    const result = await pool.query(
      `INSERT INTO ${TODO_TABLE} (description) VALUES ($1) RETURNING *`,
      [description]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const result = await pool.query(
      `UPDATE ${TODO_TABLE} SET completed = $1 WHERE id = $2 RETURNING *`,
      [completed, id]
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

// OpenAI chat endpoint
app.post('/api/chat', async (req, res) => {
  if (!openai) {
    return res.status(500).json({ error: 'OpenAI not configured' });
  }

  try {
    const { message } = req.body;
    
    // Read prompt from file
    let systemPrompt = 'Summarize the user input like Shakespeare. Return a single line for a todo list.';
    try {
      systemPrompt = fs.readFileSync('backend/prompt.txt', 'utf8').trim();
    } catch (error) {
      console.log('Using default prompt (prompt.txt not found)');
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        { role: 'user', content: message }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    const description = completion.choices[0].message.content.trim();
    
    // Add to todo list
    const result = await pool.query(
      `INSERT INTO ${TODO_TABLE} (description) VALUES ($1) RETURNING *`,
      [description]
    );

    res.json({ 
      aiResponse: description,
      todo: result.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

initDatabase();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});