const express = require('express');

const config = require('../config.js');
const placesRouter = require('./controllers/places.js');

const app = express();
const PORT = config.port;

app.use(placesRouter);

app.listen(PORT, err => {
  if (err) {
    console.log(`Error starting server: ${err}`);
  } else {
    console.log(`App listening on port ${PORT}`);
  }
});