var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var spotifywebapi = require('spotify-web-api-node');



var code = "AQDufa0K_YIoW36CSxsIHrwzucWvjG9oKAqHfDNDyTjMGdPrJWwuDfwy7Qj06JeKK0P6IbaoyqFisNGyrCrxWkMrxtqzSnEGK8HCYiUOzGmHufEu4QAy9qqyo070wcLM2uxzRoECdwD25sbKM9ZiYWbBpIYDriNNvwfduLa4O22lxcboRvRCoCcm5Jd2R3qy5yY3rGpLcg8QfMY8210gncU5NbGKntYj9g6hwSigvlz3IrFL8WrMRqTsdbUGP0Xu4M1Ic_TuTg"

var credentials = {
  clientId : '33dcfa289c814da6835416045e153409',
  clientSecret : 'fd6495784ad64660a5634bcd355a2ed8',
  redirectUri : 'https://www.example.com/callback'
};

var spotify = new spotifywebapi(credentials);

// The code that's returned as a query parameter to the redirect URI
//var code = 'MQCbtKe23z7YzzS44KzZzZgjQa621hgSzHN';

// Retrieve an access token and a refresh token
spotify.authorizationCodeGrant(code)
  .then(function(data) {
    console.log('The token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    console.log('The refresh token is ' + data.body['refresh_token']);

    // Set the access token on the API object to use it in later calls
    spotify.setAccessToken(data.body['access_token']);
    spotify.setRefreshToken(data.body['refresh_token']);
  }, function(err) {
    console.log('Something went wrong!', err);
  });





/**
 * Method to iterate WOMH's event JSON.
 * 
 * @param  {eventsJSON} JSON object containing WOMH's upcoming event 
 *
 */

function getEvents(eventsJSON) {

	json = JSON.parse(eventsJSON);	
	
	json.data.forEach(function(event) {
		var currentArtistEventName = event.name.trim();
		var artistArray = currentArtistEventName.split(",");

		artistArray.forEach(function(artist){
			currentArtist = artist.trim();
			searchSpot(currentArtist)	
		})
	});
	
	for (var i = 0, l = json.data.length; i<l; i++) {
		var currentArtistEventName = json.data[i].name;
		var artistArray = currentArtistEventName.split(",");
		var currentArtists = "";
		

		for (var x = 0, al = artistArray.length; x<al; x++) {
			currentArtist = artistArray[x].trim();
						
		}
	}
}

function searchSpot(currentArtist){
	
	spotify.searchArtists(currentArtist,{ limit : 1 })
	.then(function(data) {
		returnedRecords = data.body.artists.total;
		if(returnedRecords > 0){
			artistName = data.body.artists.items[0].name;
			artistID = data.body.artists.items[0].id;
	  		console.log('Search artists containing ' + currentArtist + ': ', artistID);
			getArtistTopTracks(artistID)
		}
	}, function(err) {
	  console.error(err);
	}).then(function(){

	});				
}

function getArtistTopTracks(artistID){

  spotify.getArtistTopTracks(artistID,'US')
    .then(function(data) {
      	 //console.log(data.body.tracks[0].name)
		 artistTrack = "spotify:track:" + data.body.tracks[0].name;
		 updatePlaylist(artistTrack)
      }, function(err) {
      	console.log('Something went wrong!', err);
    });	
	
}

function updatePlaylist(artistTrack){

  spotify.replaceTracksInPlaylist('jeffpeoples', '65GNg2l0IspPA0QCAQqzfs', [artistTrack])
    .then(function(data) {
		 console.log("SUCCESS!")
      }, function(err) {
      	console.log('Error while trying to update playlist', err);
    });		
	
}

function get_type(thing){
    if(thing===null)return "[object Null]"; // special case
    return Object.prototype.toString.call(thing);
}

function getShows(req, res) {
	url = 'https://graph.facebook.com/WhiteOakMH/events?access_token=261112694330482|913de71225b6470338f19c73c4149453&limit=1';
	request(url, function(error, response, eventsJSON) {
		if (!error) {
			getEvents(eventsJSON);
		} else {
			console.log("error")
		}
	});
};

console.log(" ")
getShows();


//console.log('WOMH artist API running on port 8081');
