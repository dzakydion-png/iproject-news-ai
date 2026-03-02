const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-domain.vercel.app',  // Update dengan Vercel domain Anda
        'https://your-api.railway.app'      // Update dengan Railway domain Anda
      ]
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:3000'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'access_token'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

app.use(errorHandler);

module.exports = app;