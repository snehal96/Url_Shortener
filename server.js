var express = require('express');
var bodyparser = require('body-parser');
var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var Url = require('./models/urls.js');
var cors = require('cors');

var app = express();
var urls = 'mongodb://localhost:27017/fcc_challenges';

mongoose.connect(urls);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection failed'));
db.once('open', function(){
	console.log('connected');
})

app.set('port', process.env.PORT || 3000);
app.set('view engine','ejs');

app.use(bodyparser.urlencoded({extended : false}));

app.get('/',function(req,res){
	res.render("index");
})

var count =0;

app.get('/new/*',function(req,res){
	var url = req.url.slice(5);
	// res.send(url);
	Url.find({"url": url},function(err, docs){
		if(err) throw err;
		// console.log(docs);
		if(docs.length===0){
			console.log("Url absent");
			create(url, res);
		
		}else{
			console.log("Url present");
			res.send(JSON.stringify({"original_url" : docs[0].url, "short_url" : docs[0].id}));
		}
	})
	// create(url);
})

app.get('/:id', function(req,res){
	var id = req.params.id;
	console.log(id);
	Url.find({"id": id},function(err,docs){
		if(err) throw err;
		if(docs.length===0){
			res.send("Wrong Input, the short url not found for any of the url to redirect!\r\n Enter a valid  Short Url");
		}else{
			var url = docs[0].url;
			res.redirect(url);
		}
	})
})

app.listen(app.get('port'),function(){
	console.log("App has started..");
})

function random(){
	var val = Math.floor(Math.random()*10000);
	return val;
}

function create(url,res){
	var count = random();
	var savedata = new Url({
		"url":url,
		"id": count
	}).save(function(err, result){
		if (err) throw err;
		// res.setHeader("Content-Type", "text/html");
 	// 	res.write("<p>Hello World</p>");
		if(result) console.log(result);
	})
}