var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

/**
 * Method to remove duplicates based on the teams that are playing from the array of games
 * 
 * @param  {Array} contains unparsed list of games as sorted by web scraper
 * @return {Array} flattened array of objects depicting games
 */
function removeDuplicates(games) {
	var uniqueGames = [];
	for (var i = 0; i < games.length; i++) {
		var game = games[i];
		var hasDuplicate = false;
		for (var j = 0; j < uniqueGames.length; j++) {
			var uniqueGame = uniqueGames[j];
			if (game.homeTeam === uniqueGame.homeTeam && game.awayTeam === uniqueGame.awayTeam) {
				hasDuplicate = true;
				break;
			}
		}
		if (!hasDuplicate) {
			uniqueGames.push(game);
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
 * Method to scrape game data from HTML.
 * 
 * @param  {html} HTML that is scraped from the NFL.com url
 * @return {Array} array of game data that is easy to parse
 */
function scrapeHistoryList(html) {
	var $ = cheerio.load(html);
	var gameList = $('div[class="list-matchup-row-center"]');
	var games = [];
	for (var i = 0; i < gameList.length; i++) {
		var game = gameList[i];
		var gameInfo = $(game).children().next().next().children().children(); // this is where you go to find the game info - maybe we can start deeper?
		var gameDetails = [];
		for (var j = 0; j < gameInfo.length; j++) {
			var printing = gameInfo[j];
			var text = $(printing).html();
			if (text.indexOf("span") === -1) { // the presence of a <span> tag indicates that we can get rid of the result, as it's just a blank line or a carriage return
				gameDetails.push(text);
			}
		}
		if (gameDetails.length > 4) {
			// game has not yet been played
			var awayTeam = gameDetails[0];
			var homeTeam = gameDetails[2];
			games.push({awayTeam : awayTeam, awayScore : 0, homeTeam : homeTeam, homeScore : 0, gameFinished : false});
		} else {
			// game has been played
			var awayTeam = gameDetails[0];
			var awayScore = parseInt(gameDetails[1]);
			var homeScore = parseInt(gameDetails[2]);
			var homeTeam = gameDetails[3];
			games.push({awayTeam : awayTeam, awayScore : awayScore, homeTeam : homeTeam, homeScore : homeScore, gameFinished : true });
		}	
	}
	return removeDuplicates(games);
}

function scrapeLiveList(html) {
	var $ = cheerio.load(html, {
		normalizeWhitespace: true,
		xmlMode: true
	});
	var gameList = $('div[class="new-score-box"]');
	var games = [];
	for (var i = 0; i < gameList.length; i++) {
		var game = gameList[i];
		var awayTeamInfo = parseTeamInfo($(game).children().first().children().children().next());
		var homeTeamInfo = parseTeamInfo($(game).children().next().children().children().next());
		var gameTime = $(game).children().next().next().children().next().children().first().text();
		var gameStarted = false;
		var gameFinished = true;
		if (awayTeamInfo.hasOwnProperty("finalScore")) {
			gameStarted = true;
		}
		if (gameTime.indexOf("FINAL") === -1) {
			gameFinished = false;
		}
		games.push({"awayTeam": awayTeamInfo, "homeTeam": homeTeamInfo, "gameStarted": gameStarted, "gameFinished": gameFinished});
	}
	return games;
}

function parseTeamInfo(teamInfoData) {
	var $ = cheerio.load(teamInfoData);
	var teamInfo = $(teamInfoData).children().children();
	var teamRecord = $(teamInfo).first().text().replace(/\s/g, "");
	var recordArray = splitRecord(teamRecord);
	var teamNameArray = $(teamInfo).first().next();

	let teamName = $(teamNameArray).text().replace(/\s/g, "") ;
	let wins = recordArray[0];
	let losses = recordArray[1];
	let ties = recordArray[2];
	let finalScore = $(teamInfoData).children().next().html();
	if (finalScore === '--') {
		return ({"teamName": teamName, "record" : {"wins": wins, "losses": losses, "ties": ties}});		
	} else {
		var totalScore = $(teamInfoData).children().next().children();
		let organizedScores = splitScores(totalScore);
		return ({"teamName": teamName, "record" : {"wins": wins, "losses": losses, "ties": ties}, "finalScore": parseInt(finalScore), "scoreByQuarter": organizedScores});
	}
}

/**
 * GET route that allows entry of year and week to get historical year data
 */
app.get('/schedule/:year/:week', function(req, res) {
	var validationError = validate(req.params.week, req.params.year);
	if (validationError) {
		res.statusCode = 400;
		res.send({"error" : validationError});
		console.log("400 GET " + req.hostname + req.originalUrl);
		return;
	}
	url = 'http://www.nfl.com/schedules/' + req.params.year + '/REG' + req.params.week;
	request(url, function(error, response, html) {
		if (!error) {
			console.log(response.statusCode + " GET " + url);
			var games = scrapeHistoryList(html);
			res.statusCode = 200;
			res.send({"games" : games});
		} else {
			res.statusCode = 406;
			res.send({"error" : error});
		}
	});
}),

/**
 * [description]
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {	var        validationError [description]
 * @return {[type]}      [description]
 */
app.get('/live/:year/:week', function(req, res) {
	var validationError = validate(req.params.week, req.params.year);
	if (validationError) {
		res.statusCode = 400;
		res.send({"error" : validationError});
		console.log("400 GET " + req.hostname + req.originalUrl);
		return;
	}
	debugger;
	url = 'http://www.nfl.com/scores/' + req.params.year + '/REG' + req.params.week;
	request(url, function(error, response, html) {
		if (!error) {
			console.log(response.statusCode + " GET " + url);
			var games = scrapeLiveList(html);
			res.statusCode = 200;
			res.send({"games" : games});
		} else {
			res.statusCode = 406;
			res.send({"error" : error});
		}
	});
})



app.listen('8081')

console.log('NFL Score API running on port 8081');

exports = module.exports = app;