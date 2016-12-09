var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.get('/schedule/:year/:week', function(req, res) {
	var year = req.params.year;
	var week = req.params.week;
	var currentYear = new Date().getFullYear();

	if (currentYear < year) {
		res.statusCode = 400;
		res.send({"error" : "Invalid year"});
		return;
	}
	if (week < 1 || week > 17) {
		res.statusCode = 400;
		res.send({"error" : "Invalid week"});
		return;
	}
	console.log("Request for week " + week + " from year " + year + ".");
	url = 'http://www.nfl.com/schedules/' + year + '/REG' + week;
	request(url, function(error, response, html) {
		if (!error) {
			var $ = cheerio.load(html);
			var gameList = $('div[class="list-matchup-row-center"]');
			var games = [];
			for (var i = 0; i < gameList.length; i++) {
				var game = gameList[i];
				var gameInfo = $(game).children().next().next().children().children();
				var gameDetails = [];
				for (var j = 0; j < gameInfo.length; j++) {
					var printing = gameInfo[j];
					var text = $(printing).html();
					if (text.indexOf("span") === -1) {
						gameDetails.push(text);
					}
				}
				if (gameDetails.length > 4) {
					// game has not yet been played
					var awayTeam = gameDetails[0];
					var homeTeam = gameDetails[2];
					games.push({awayTeam : awayTeam, homeTeam : homeTeam, gameInProgress : false, gameFinished : false, homeScore : 0, awayScore : 0});
				} else {
					// game has been played
					// need to see what differentiates a game that is in progress, and put it here
					var awayTeam = gameDetails[0];
					var awayScore = parseInt(gameDetails[1]);
					var homeScore = parseInt(gameDetails[2]);
					var homeTeam = gameDetails[3];
					games.push({awayTeam : awayTeam, homeTeam : homeTeam, gameInProgress : false, gameFinished : true, homeScore : homeScore, awayScore : awayScore});
				}	
			}
		} else {
			res.statusCode = 406;
			res.send({"error" : error});
		}
		res.statusCode = 200;
		res.send({"games" : games});
	});
})

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;