## NFL Score API

[![Twitter](https://img.shields.io/badge/contact-@dokun24-blue.svg?style=flat)](https://twitter.com/dokun24)
[![License](http://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://github.com/dokun1/firstRuleFireplace/blob/master/LICENSE)

## About
This service uses [cheerio.js](http://cheerio.js.org) to scrape the NFL's [website](http://www.nfl.com) for score information. 

This service is also currently deployed to `https://nfl-score-scraper.mybluemix.net`, and can be tested right now without authentication.

To run locally, perform the following steps:

- `npm install`
- `node .`

## Usage

For historical score data:

- `http://localhost:8081/schedule/2016/1`

For live, more granular score data:

- `http://localhost:8081/live/2016/1`

*2016* is the year, *1* is the week. 

## Contribution Guide

- Check the issues list, and feel free to add one if you think this needs something.
- Be nice, and be cool.
- Be helpful - I'm a mobile developer learning Node!

## Roadmap

- Add authentication
- Add support for games currently in progress
