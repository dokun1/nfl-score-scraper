var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var spotifywebapi = require('spotify-web-api-node');

var trackArray = [];
var numberOfBands = 33;
var tracksReturned = 0;

var spotify = new spotifywebapi({
  clientId : '33dcfa289c814da6835416045e153409',
  clientSecret : 'fd6495784ad64660a5634bcd355a2ed8',
  redirectUri : ''
});

spotify.setAccessToken('BQDBndu_TN1DbcJldlfngip9QUNHCOkUjX6x0Dm2JKPZZH-fdoVXyShdugd6X7ebpm1mLjXqSIr5rHIW66kQhOcsjj0imGFQ4JPTE3C6Qh8GBmyyIZ9vCaqlcjLqBb-BdKO2xwkCd21Y5-xod59rVqDQr8aMTN0LvuuX1sBvQGXaUUwO77BHqjsl2DSMpzSX5nPBOJ3n1c3KqKZ4OCKDM9CkiM105lbRAHqLGfQC');

/**
 * Method to iterate WOMH's event JSON.
 * 
 * @param  {eventsJSON} JSON object containing WOMH's upcoming event 
 *
 */

function getEvents(eventsJSON) {

	json = JSON.parse(eventsJSON);	
	
	x = 0;
	json.data.forEach(function(event) {
		var currentArtistEventName = event.name.trim();
		var artistArray = currentArtistEventName.split(",");
		//x = x + 1;

		artistArray.forEach(function(artist){
			currentArtist = artist.trim();
			searchSpot(currentArtist);	
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
	  		console.log("S: " + currentArtist + "\nF: " + artistName + "\n\n");
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
		 artistTrack = "spotify:track:" + data.body.tracks[0].id;
		 //console.log(data.body.tracks[0].id)
		 trackArray.push(artistTrack);
		 tracksReturned++;
		 
		 if (tracksReturned == numberOfBands){
		 	updatePlaylist(trackArray)	
		 }
		 
      }, function(err) {
      	console.log('Something went wrong! getArtistTopTracks', err);
    });	
	
}

function updatePlaylist(trackArray){
	console.log("Attempting to add array to playlist:" + trackArray)
  	spotify.replaceTracksInPlaylist('jeffpeoples', '65GNg2l0IspPA0QCAQqzfs', trackArray)
	//spotify.replaceTracksInPlaylist('jeffpeoples', '65GNg2l0IspPA0QCAQqzfs', ["spotify:track:6S6RUMbuYs8AvkaNpDhgMd","spotify:track:71cUqXJ3h1r0Ees6YdENLU"])
    .then(function(data) {
		 //console.log(artistTrack + " added to playlist")
      }, function(err) {
      	console.log('Something went wrong! updatePlaylist with track: ' + artistTrack, err);
    });		
	
}

function get_type(thing){
    if(thing===null)return "[object Null]"; // special case
    return Object.prototype.toString.call(thing);
}

function getShows(req, res) {
	url = 'https://graph.facebook.com/WhiteOakMH/events?access_token=261112694330482|913de71225b6470338f19c73c4149453&limit=' + numberOfBands;
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
//updatePlaylist("a")

//console.log('WOMH artist API running on port 8081');
