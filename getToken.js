var spotifywebapi = require('spotify-web-api-node');


var scopes = ['playlist-modify-private', 'playlist-modify-public'],
    redirectUri = 'http://localhost/',
    clientId = '33dcfa289c814da6835416045e153409',
    state = 'some-state-of-my-choice';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifywebapi = new spotifywebapi({
  redirectUri : redirectUri,
  clientId : clientId
});

// Create the authorization URL
var authorizeURL = spotifywebapi.createAuthorizeURL(scopes, state);

// https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
console.log(authorizeURL);