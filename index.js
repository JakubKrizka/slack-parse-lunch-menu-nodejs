// require components
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

// app define
var app = express();

// define port running
var port = process.env.PORT || 3000;

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// test route
app.get('/', function (req, res) { res.status(200).send('Hello world, this is GET / route of nodejs-slack-lunch. Running on NodeJS - awesome framework :)') });

// error handler
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(400).send(err.message);
});

// console notice
app.listen(port, function () {
  console.log('nodejs-slack-lunch listening on port ' + port);
});

// define first restaurant 
app.post('/racek', function(req, res){
	// parse this website
	url = 'http://www.restaurace-racek.cz/sluzby/denni-menu/';
	// send request
	request(url, function(error, response, html){
		if(!error){
			// load HTML
			var $ = cheerio.load(html);
			// define <body> or .class od #id what we need parse
			$('body').filter(function(){
				// get data
				var data = $(this);
				test_str = data.text();
				// get today number, Mon = 1 ... Wed = 3 ... Fri = 5 ...
				var date = moment().day();
				// we don't need weekends
				var match = true;
				// parse \t
				test_str = test_str.replace(/\t/g, '');
				// and parse more then one \n to one \n
				test_str = test_str.replace(/^\s*\n/gm, '\n');
				// switch date to parse only that day ;) Mon - Fri else match = false
				switch (date) {
					case 1:
						var start_pos = test_str.indexOf('PONDĚLÍ');
						var end_pos = test_str.indexOf('ÚTERÝ',start_pos);
						break;
					case 2:
						var start_pos = test_str.indexOf('ÚTERÝ');
						var end_pos = test_str.indexOf('STŘEDA',start_pos);
						break;
					case 3:
						var start_pos = test_str.indexOf('STŘEDA');
						var end_pos = test_str.indexOf('ČTVRTEK',start_pos);
						break;
					case 4:
						var start_pos = test_str.indexOf('ČTVRTEK');
						var end_pos = test_str.indexOf('PÁTEK',start_pos);
						break;
					case 5:
						var start_pos = test_str.indexOf('PÁTEK');
						var end_pos = test_str.indexOf('window.google_analytics_uacct',start_pos);
						break;
					default:
						match = false;
				}
				// if is not weekends
				if (match) {
					var text_to_get = test_str.substring(start_pos,end_pos)
				} else {
					text_to_get = "Dneska se nevaří... objednej #damejidlo nebo #pizza";
				}
				// create JSON to slackbot
				var botPayload = {
					text : text_to_get
				};
				return res.status(200).json(botPayload);
			})
		}
	})
})

// second restaurant is on the same model, but another replace and indexOf
app.post('/cestaci', function(req, res){
	url = 'http://www.hedvabnastezka.cz/klub-cestovatelu-brno/poledni-menu-2/';
	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);
			$('#article').filter(function(){
				var data = $(this);
				test_str = data.text();
				var date = moment().day();
				var match = true;
					//test_str = test_str.replace(/1./g, '\n\n1.');
					//test_str = test_str.replace(/2./g, '\n\n2.');
					//test_str = test_str.replace(/3./g, '\n\n3.');
				switch (date) {
					case 1:
						var start_pos = test_str.indexOf('Pondělí');
						var end_pos = test_str.indexOf('Úterý',start_pos);
						break;
					case 2:
						var start_pos = test_str.indexOf('Úterý');
						var end_pos = test_str.indexOf('Středa',start_pos);
						break;
					case 3:
						var start_pos = test_str.indexOf('Středa');
						var end_pos = test_str.indexOf('Čtvrtek',start_pos);
						break;
					case 4:
						var start_pos = test_str.indexOf('Čtvrtek');
						var end_pos = test_str.indexOf('Pátek',start_pos);
						break;
					case 5:
						var start_pos = test_str.indexOf('Pátek');
						var end_pos = test_str.indexOf('Restaurace',start_pos);
						break;
					default:
						match = false;
				}
				if (match) {
					var text_to_get = test_str.substring(start_pos,end_pos)
				} else {
					text_to_get = "Dneska se nevaří... objednej #damejidlo nebo #pizza";
				}
				var botPayload = {
					text : text_to_get
				};
				return res.status(200).json(botPayload);
			})
		}
	})
})