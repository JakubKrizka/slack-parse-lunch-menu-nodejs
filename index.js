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
app.use(bodyParser.urlencoded({extended: true}));

// test route
app.get('/', function (req, res) {
    res.status(200).send('Hello world, this is GET / route of nodejs-slack-lunch. Running on NodeJS - awesome framework :)')
});

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
app.post('/racek', function (req, res) {
    request('http://www.restaurace-racek.cz/sluzby/', function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            $('.wsw table tbody').filter(function () {
                var $this = $(this);
                $this.html($this.html().replace(/\t|\n|[ ]{2}/g, ''));
                $this.find("tr").each(function () {
                    var $this = $(this);
                    var secondColumn = $this.find('td:nth-child(2)');
                    if (!secondColumn.text().trim()) {
                        $this.remove();
                    } else {
                        var firstColumn = $this.find('td:nth-child(1)');

                        if (firstColumn.text().trim()) {
                            firstColumn.text('\t' + firstColumn.text() + '\t');
                        }
                        secondColumn.text(secondColumn.text() + '\t');
                        $this.replaceWith('\n' + $this.text());
                    }
                });

                return res.status(200).json({
                    text: $this.text()
                });

            })
        }
    })
});

app.post('/cestaci', function (req, res) {
    request('http://www.hedvabnastezka.cz/klub-cestovatelu-brno/poledni-menu-2/', function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            var date = moment().day();

            $('.article-content p:nth-child(' + (2 + date) + ')').filter(function () {
                var $this = $(this);
                $this.html($this.html().replace(/\t|\n|[ ]{2}/g, ''));
                $this.find('strong').each(function () {
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
                    text: text
                });

            })
        }
    })
})

app.post('/vietmac', function (req, res) {
    request('https://www.zomato.com/cs/brno/pad-thai-kr%C3%A1lovo-pole-brno-sever/', function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            $('#tabtop .menu-preview.bb5').filter(function () {
                var $this = $(this);
                $this.html($this.html().replace(/\t|\n|[ ]{2}/g, ''));

                $this.find('.res-info-headline span.hdn').remove();
                var span = $this.find('.res-info-headline span');
                span.text('\t' + span.text());
                var time = $this.find('.res-info-headline .dm-serving-time');
                time.text('\t' + time.text() + '\n');
                $this.find('.tmi-groups .tmi-group .tmi-daily .tmi-price').each(function(){
                    var $this = $(this);
                    $this.text('\t' + $this.text() + '\n');
                });

                return res.status(200).json({
                    text: $this.text()
                });

            })
        }
    })
});



app.post('/ocean', function (req, res) {
    request('http://www.ocean48.cz/bistro/nabidka', function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            $('.content .left-half.col').filter(function () {
                var $this = $(this);
                $this.html($this.html().replace(/\r\n|\t|\n|[ ]{2}/g, ''));

                var menu = $this.find('table.bistro-menu');
                menu.not(menu = menu.first()).remove();

                var title = $this.find('> h2');
                title.not(title = title.first()).remove();
                title.text(title.text() + '\n');

                menu.find('tr td.price').each(function(){
                    var $this = $(this);
                    $this.text('\t' + $this.text() + '\n');
                });

                menu.find('tr td.menu-item-text-col span.small').each(function(){
                    var $this = $(this);
                    if ($this.text().trim()){
                        $this.text('\n\t' + $this.text());
                    }
                });

                return res.status(200).json({
                    text: $this.text()
                });

            })
        }
    })
});