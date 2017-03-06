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
	function findTextAndReturnRemainder(target, variable){
	    var chopFront = target.substring(target.search(variable)+variable.length,target.length);
	    var result = chopFront.substring(0,chopFront.search(";"));
	    return result;
	}
	var text = $($('script')).text();
	var findAndClean = findTextAndReturnRemainder(text,"var stubwireEvents =");
	findAndClean = "\"" + findAndClean + "\"";
	var result = JSON.parse(findAndClean);

	console.log(result);

	return showList;
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