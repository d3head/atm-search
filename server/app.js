var express = require('express'),
		app = express(),
		request = require('request'),
		fs = require('fs'),
		cors = require('cors');

/* MIDDLEWARE */
app.use(express.logger());
app.use(express.compress());
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

/* CONFIGURATION */
var atm_json = "http://json.alfabank.ru/atm/0.1/list/?property=own&city=54";


var replaceHtmlEntites = (function() {
  var translate_re = /&(nbsp|amp|quot|lt|gt|laquo|raquo);/g;
  var translate = {
    "nbsp"	: " ",
    "amp" 	: "&",
    "quot"	: "\"",
    "lt"  	: "<",
    "gt"  	: ">",
		"laquo" : "«",
		"raquo" : "»"
  };
  return function(s) {
    return ( s.replace(translate_re, function(match, entity) {
      return translate[entity];
    }) );
  }
})();

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

/* API */
app.get('/search/:name', function(req, res, next) {
	var query = new RegExp( req.params[ 'name' ], "i" )
	console.log (query);
	var newArr = []

	atms = function(arr) {
		for(key in arr)
		{
				newArr.push(arr[key]);
		}
	}

	doSearch = function(body, cached) {
		if(cached == 1) {
			atms(JSON.parse(body).response.data);
		} else {
			atms(JSON.parse(replaceHtmlEntites(body)).response.data);
		}
		var results = [];
		for (var i = 0 ; i < newArr.length ; i++)
		{
				if (newArr[i]['address'].search(query) != -1 || newArr[i]['title'].search(query) != -1) {
						results.push(newArr[i]);
				}
		}
		res.json(results);
	}

	if(req.query.cached == 1) {
		fs.readFile('atm.json', function (err, body) {
			if (err) throw err;
			doSearch(body, 1);
		});
	} else {
		request(atm_json, function (error, resp, body) {
			if (!error && res.statusCode == 200) {
				doSearch(body, 0);
			} else {
				res.send("Err");
			}
		})
	}
});

var server = app.listen(3006, function() {
    console.log('Listening on port %d', server.address().port);
});
