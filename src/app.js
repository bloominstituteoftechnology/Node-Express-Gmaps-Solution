const express = require('express');
const fetch = require('node-fetch');

const config = require('../config.js');

const app = express();
const PORT = config.port;
const STATUS_SUCCESS = 200;
const STATUS_USER_ERROR = 422;
const KEY_GMAPS_PLACES = config.gmaps.apiKeys.places;
const URI_TEXT_SEARCH = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=';
const URI_PLACE_DETAILS = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=';

app.get('/place', (req, res) => {
  getIds(req.query.search)
    .then(ids => [ids[0]])
    .then(getDetails)
    .then(details => {
      res.status(STATUS_SUCCESS);
      res.send( {places: details} );
    })
    .catch(err => {
      console.log(err);
      res.status(STATUS_USER_ERROR);
      res.send( {err: err} );
    });
});

app.get('/places', (req, res) => {
  getIds(req.query.search)
    .then(getDetails)
    .then(details => {
      res.status(STATUS_SUCCESS);
      res.send( {places: details} );
    })
    .catch(err => {
      res.status(STATUS_USER_ERROR);
      res.send( {err: err} );
    });
});

function getIds(query) {
  return new Promise((resolve, reject) => {
    const searchUrl = URI_TEXT_SEARCH + query + '&key=' + KEY_GMAPS_PLACES;
    fetch(searchUrl)
      .then(places => places.json())
      .then(places => {
        const ids = places.results.map(place => place.place_id);
        resolve(ids);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getDetails(ids) {
  return new Promise((resolve, reject) => {
    const details = ids.map(id => {
    const detailsUrl = URI_PLACE_DETAILS + id + '&key=' + KEY_GMAPS_PLACES;
    return fetch(detailsUrl)
      .then(detailed => detailed.json())
      .then(detailed => detailed.result);
    });

    Promise.all(details)
      .then(details => {
        resolve(details);
      })
      .catch(err => {
        reject(err);
      });
  });
}

app.listen(PORT, err => {
  if (err) {
    console.log(`Error starting server: ${err}`);
  } else {
    console.log(`App listening on port ${PORT}`);
  }
});