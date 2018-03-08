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
  let search = req.query.search.split(' ');
  search = search.join('+');
  const searchUrl = URI_TEXT_SEARCH + search + '&key=' + KEY_GMAPS_PLACES;
  console.log("url", searchUrl);
  fetch(searchUrl, { method: 'GET'})
    .then(places => places.json())
    .then(places => {
      const placeId = places.results[0].place_id;
      const detailsUrl = URI_PLACE_DETAILS + placeId + '&key=' + KEY_GMAPS_PLACES;
      fetch(detailsUrl)
        .then(details => details.json())
        .then(details => {
          res.status(STATUS_SUCCESS);
          res.send(details.result);
        })
        .catch(err => {
          console.log(err);
          res.status(STATUS_USER_ERROR);
          res.send({ err: err} );
        });
    })
    .catch(err => {
      console.log(err);
      res.status(STATUS_USER_ERROR);
      res.send( {err: err} );
    });
});

app.get('/places', (req, res) => {
  const search = req.query.search;
  const searchUrl = URI_TEXT_SEARCH + search + '&key=' + KEY_GMAPS_PLACES;

  fetch(searchUrl)
    .then(places => places.json())
    .then(places => {
      placeIds = places.results.map(place => place.place_id);
      details = placeIds.map(id => {
        const detailsUrl = URI_PLACE_DETAILS + id + '&key=' + KEY_GMAPS_PLACES;
        return fetch(detailsUrl)
          .then(detailed => detailed.json())
          .then(detailed => detailed.result);
      });

      Promise.all(details)
        .then(details => {
          res.status(STATUS_SUCCESS);
          res.send( {places: details} )
        })
        .catch(err => {
          console.log(err)
          res.status(STATUS_USER_ERROR);
          res.send( {err: err});
        });
    })
    .catch(err => {
      console.log(err)
      res.status(STATUS_USER_ERROR);
      res.send( {err: err} );
    });
});

app.listen(PORT, err => {
  if (err) {
    console.log(`Error starting server: ${err}`);
  } else {
    console.log(`App listening on port ${PORT}`);
  }
});