var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var spotifywebapi = require('spotify-web-api-node');



// credentials are optional
var spotify = new spotifywebapi({
  clientId : '33dcfa289c814da6835416045e153409',
  clientSecret : 'fd6495784ad64660a5634bcd355a2ed8',
  redirectUri : ''
});

spotify.setAccessToken('BQAW8eX6f8dfduqqt7B4m0ephJq6WB9KlE9F-lrKl7qSaXe9WkE2BkCYibldt4cpyRCNKnYIHUvK7nS3JAo7-x2aI-x9pT7tpx-nTTuwPn84ycP1sLOuaPtWBEeW5AG208MAdyimN408SthvWsbKOTIMpJQ6xL6veNYf2tW68_Es_u5_c7Z7GtVV9oGoTmIlL1IBgj3mZNVIvl_1Q6jGySOVZsmANer3vLWoNTNE');

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
      	console.log('Something went wrong!', err);
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
