const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Basic routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/teams-players', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/teams-players.html'));
});

app.get('/betting', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/betting.html'));
});

app.get('/fantasy', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/fantasy.html'));
});

app.get('/ai', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/ai.html'));
});

app.get('/community', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/community.html'));
});

// API routes placeholder
app.get('/api/teams', (req, res) => {
    res.json({ message: 'Teams API endpoint' });
});

app.get('/api/players', (req, res) => {
    res.json({ message: 'Players API endpoint' });
});

app.get('/api/betting', (req, res) => {
    res.json({ message: 'Betting API endpoint' });
});

app.get('/api/fantasy', (req, res) => {
    res.json({ message: 'Fantasy API endpoint' });
});

app.get('/api/ai', (req, res) => {
    res.json({ message: 'AI API endpoint' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 KnowBall server running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, '../public')}`);
});
