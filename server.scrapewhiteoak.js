var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

/**
 * Method to remove duplicates based on the teams that are playing from the array of shows
 * 
 * @param  {Array} contains unparsed list of shows as sorted by web scraper
 * @return {Array} flattened array of objects depicting shows
 */
function removeDuplicates(shows) {
	var uniqueGames = [];
	for (var i = 0; i < shows.length; i++) {
		var show = shows[i];
		var hasDuplicate = false;
		for (var j = 0; j < uniqueGames.length; j++) {
			var uniqueGame = uniqueGames[j];
			if (show.homeTeam === uniqueGame.homeTeam && show.awayTeam === uniqueGame.awayTeam) {
				hasDuplicate = true;
				break;
			}
		}
		if (!hasDuplicate) {
			uniqueGames.push(show);
		}
	}
	return uniqueGames;
}

/**
 * Method to validate if the params passed into the original request are valid
 *
 * @param  {Number} The week that is requested for score lookups
 * @param  {Number} The year that is requested for score lookups
 * @return {Object} If there is an issue, an error message is returned
 */
function validate(week, year) {
	var currentYear = new Date().getFullYear();
	if (currentYear < year) {
		return "Invalid year";
	}
	if (week < 1 || week > 17) {
		return "Invalid week";
	}
	return null;
}

function splitRecord(recordString) {
	var recordArray = recordString.split("-");
	var returnArray = [];
	for (var i = 0; i < recordArray.length; i++) {
		var string = recordArray[i];
		var stripped = string.replace(/\D/g,'');
		returnArray.push(parseInt(stripped));
	}
	return returnArray;
}

function splitScores(scores) {
	var $ = cheerio.load(scores);
	var scoreMap = {};
	var max = 4;
	if (scores.length > 4) {
		max = scores.length;
	}
	for (var i = 0; i < max; i++) {

		var score = 0;
		if (i < scores.length) {
			score = $(scores[i]).text();
		}
		if (i < 4) {
			scoreMap['Q' + (i + 1)] = parseInt(score);
		} else if (i == 4 && !isNaN(parseInt(score))) {
			console.log(parseInt(score) + " is not null");
			scoreMap['OT'] = parseInt(score);
		}
	}
	return scoreMap;
}

/**
 * Method to scrape show data from HTML.
 * 
 * @param  {html} HTML that is scraped from the NFL.com url
 * @return {Array} array of show data that is easy to parse
 */

function scrapeLiveList(html) {
	var $ = cheerio.load(html, {
		normalizeWhitespace: true,
		xmlMode: true
	});
	
	//var showList = $('stubwireEvents');
	var showList = {};
	
	var totalScriptTags = $('script').length; // no longer 0
	
	// NOW INTERATE OVER ALL SCRIPTS HERE - CHECK EACH TO SEE IF ITS THE ONE WE WANT
	// iterate on all of the JS blocks in the page
	$('script').each( function () {
		var text = $(this).text();
		var str = text.substr(text.indexOf('var stubwireEvents = {'), text.indexOf('}'));
		var str = str.trim();
		if (str.substring(0, 8) == "var stub") {
			var str = {};
			var str = text.substr(text.indexOf('{'), text.indexOf('}'));
			str = str.substring(0, str.length - 2);
			console.log(str);
			
			JSON.stringify(eval("(" + str + ")"));
			//str = JSON.stringify(str);
			//JSON.stringify(str);
			JSON.parse(str);
			
			
			var info = {
			'fname': 'Bhaumik',
			'lname': 'Mehta',
			'Age': '34'
			};			
			

			//str = JSON.stringify(str);
			//str = JSON.parse(str);
			
			
			for(key in str) {
			  var infoJSON = str[key];
			  console.log(infoJSON);
			}	
			
			console.log(get_type(str));
			//console.log(info);	
		}
		//console.log('JS: %s',$(this).text());
	});

	return showList;
}

function get_type(thing){
    if(thing===null)return "[object Null]"; // special case
    return Object.prototype.toString.call(thing);
}

/**
 * [description]
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {	var        validationError [description]
 * @return {[type]}      [description]
 */
app.get('/live/:week/:month', function(req, res) {
	url = 'http://www.whiteoakmusichall.com/calendar/';
	request(url, function(error, response, html) {
		if (!error) {
			console.log(response.statusCode + " GET " + url);
			var shows = scrapeLiveList(html);
			res.statusCode = 200;
			//res.send(html);
			//res.send({"shows" : "shows"});
			res.send({"shows" : shows});
		} else {
			res.statusCode = 406;
			res.send({"error" : error});
		}
	});
})



app.listen('8081')

console.log('WOMH artist API running on port 8081');

exports = module.exports = app;