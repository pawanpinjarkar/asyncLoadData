const bodyParser = require('body-parser');
const express = require('express');
const client = require('../client');

const app = express();

app.set('port', 6400);

const server = app.listen(app.get('port'), function () {
  console.log(`Server listening on port ${app.get('port')} press CTRL+C to terminate.`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // for parsing application/json

// call the loadCache at the start of server
client.loadCache();

/**
 * API to forcefully refresh the app data cache
 */
app.get('/refreshCache', client.refreshCache);
