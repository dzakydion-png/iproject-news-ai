if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

app.use(cors()); // Supaya frontend  bisa akses
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

app.use(errorHandler);

module.exports = app;