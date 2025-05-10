require('dotenv').config();
const axios = require("axios");
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const weatherApp = express();
const PORT = 5000;

// middleware
weatherApp.use(cors());
weatherApp.use(express.json());


// MySQL connection using .env
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  db.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err.stack);
      return;
    }
    console.log('Connected to database');
  });

  // POST /api/weather — Proxy to OpenWeatherMap and log search
  weatherApp.post('/api/weather', async (req, res) => {
    const { city } = req.body;
    const apiKey = process.env.OPENWEATHER_API_KEY;
  
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }
  
    try {
      // 1. Call OpenWeatherMap API
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      const weatherData = weatherResponse.data;
  
      // 2. Save search history
      const searchTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const query = `INSERT INTO search_history (city, time) VALUES (?, ?)`;
  
      db.query(query, [city, searchTime], (err, result) => {
        if (err) {
          console.error('DB Insert Error:', err.message);
          return res.status(500).json({ error: 'Failed to save search' });
        }
        // 3. Send weather data only if DB insert succeeded
        res.json(weatherData);
      });
    } catch (err) {
      // Handle OpenWeatherMap specific 404 error
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ error: 'City not found' });
      }
  
      console.error('Weather API Error:', err.message);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });
  

  weatherApp.get('/api/recent-searches', (req, res) => {
    const query = 'SELECT * FROM search_history ORDER BY time DESC LIMIT 5';
    db.query(query, (err, results) => {
        if (err) {
            console.error('DB Query Error:', err.message);
            return res.status(500).json({ error: 'Failed to fetch recent searches' });
        }
        res.json(results);
    });
});



  weatherApp.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });