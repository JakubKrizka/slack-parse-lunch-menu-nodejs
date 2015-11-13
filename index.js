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
	url = 'http://www.restaurace-racek.cz/sluzby/';
	// send request
	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);
			
			$('.wsw table tbody').filter(function(){
				var $this = $(this);
				$this.html($this.html().replace(/\t|\n/g, ''));
				$this.find("tr").each(function(){
					var $this = $(this);
					var secondColumn = $this.find('td:nth-child(2)');
					if (!secondColumn.text().trim()) {
						$this.remove();
					} else {
						var thirdColumn = $this.find('td:nth-child(3)');
						if (thirdColumn.text().trim()) {
							thirdColumn.text('\t' + thirdColumn.text());
						}
						secondColumn.text('\t' + secondColumn.text());
						$this.replaceWith('\n' + $this.text());
					}
				})
				
				return res.status(200).json({
					text : $this.text()
				});

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

			var date = moment().day();

			$('.article-content p:nth-child('+ (3+date) +')').filter(function(){
				var $this = $(this);
				$this.find('strong').each(function(){
					var $this = $(this);
					$this.replaceWith('\t' + $this.text());
				});
				html = $this.html();
				html = html.replace(/<br>/g, '\n');
				
				var text = $(html).text().trim();

				if (!text) {
					text = 'nic';
				}

				return res.status(200).json({
					text : text
				});
				
			})
		}
	})
})

app.post('/vietmac', function(req, res){
	url = 'https://www.zomato.com/cs/brno/pad-thai-kr%C3%A1lovo-pole-brno-sever/';
	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);
			$('body').filter(function(){
				var data = $(this);
				test_str = data.text();
				var date = moment().day();
				
					test_str = test_str.replace(/  /g, '');
					test_str = test_str.replace(/\n\n\n\n\n\n\n\n\n/g, '\n');
					test_str = test_str.replace(/\n\n\n\n/g, ' ');
				
						var start_pos = test_str.indexOf('(Dnes)');
						var end_pos = test_str.indexOf('Menu',start_pos);
						
				
					var text_to_get = test_str.substring(start_pos,end_pos)
				
				var botPayload = {
					text : text_to_get
				};
				return res.status(200).json(botPayload);
			})
		}
	})
})
