var express = require('express'),
		app = express(),
		request = require('request'),
		fs = require('fs');

/* MIDDLEWARE */
app.use(express.logger());
app.use(express.compress());
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());

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
app.get('/parse', function(req, res, next) {
	var newArr = []
  atms = function(arr) {

    for(key in arr)
    {
        newArr.push(arr[key]);
    }
	}

	request('http://127.0.0.1:9000/atm.json', function (error, resp, body) {
		if (!error && res.statusCode == 200) {
			var arr = JSON.parse(body);
			atms(arr.response.data);
			res.json(newArr);
		} else {
			res.send("Err");
		}
	})
});

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

	request('http://127.0.0.1:9000/atm.json', function (error, resp, body) {
		if (!error && res.statusCode == 200) {
			var arr = JSON.parse(replaceHtmlEntites(body));
			atms(JSON.parse(replaceHtmlEntites(body)).response.data);
			var results = [];
			for (var i = 0 ; i < newArr.length ; i++)
			{
			    if (newArr[i]['address'].search(query) != -1 || newArr[i]['title'].search(query) != -1) {
			        results.push(newArr[i]);
			    }
			}
			res.json(results);
		} else {
			res.send("Err");
		}
	})
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
