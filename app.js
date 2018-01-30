var express = require("express");
var http = require("http");
var mongo = require("mongodb").MongoClient;

var url = "mongodb://localhost:27017/urlshortener";
var app = express();

app.get("/new/:url(*)",function(req,res){
    res.writeHead(200, { "Content-Type": "text/plain" });
    if(/http:\/\/www\.\w+\.com\/?/.test(req.params.url)) {
        var original_url = req.params.url;
        // connect to database
        mongo.connect(url,function(error,db){
            if(error) console.error(error);
            // connect to collection of saved urls\
            var db1 = db.db("urlshortener");
            var urls = db1.collection("urls");
            // try to find url in database
            urls.find({"original_url": original_url}).toArray(function(err,docs){
                if(err) console.error(err);
                if(docs.length === 0) {
                    // if url is not found, get availble short url number
                    urls.find({"name":"used ids"},{"_id":0,"available":1}).toArray(function(err,docs){
                        if(err) console.error(err);
                        var url_number = docs[0].available; // available short url number
                        // create short url
                        var url_result = {"original_url": original_url, 
                                          "short_url": "https://short-url-guilhermesalome.c9users.io/" + url_number};
                        // save short and long url
                        urls.insertOne(url_result,function(e,r){
                            if(e) console.error(e);
                            // update available and display url
                            urls.updateOne({"name" : "used ids"},{$set : {"available" : Number(url_number)+1}},function(er,rs){
                                res.end(JSON.stringify({"original_url": url_result.original_url,"short_url":url_result.short_url}));
                                db.close();
                            });
                        })
                    });
                } else {
                    // if url is found, return it
                    res.end(JSON.stringify({"original_url" : docs[0].original_url, "short_url" : docs[0].short_url}));
                    db.close();
                }
            });
        });
    } else {
        res.end(JSON.stringify({"error":"Wrong url format, make sure you have a valid protocol and real site."}));
    }
});

app.get('/[0-9]+',function(request,response){
    // redirects to original url
    var url_number = request.url.slice(1);
    mongo.connect(url,function(error,db){
        if(error) console.error(error);
        var db1 = db.db("urlshortener");
        var urls = db1.collection("urls");
        urls.find({"short_url": "https://short-url-guilhermesalome.c9users.io/" + url_number}).toArray(function(err,docs){
            if(err) console.error(err);
            if(docs.length === 0) {
                response.end(JSON.stringify({"error": "invalid number, url not in the database, please use /new/:url"}));
                db.close();
            } else {
                response.redirect(docs[0].original_url);
                response.end();
                db.close();    
            }
        });
    });
});

app.get("*",function(request,response) {
    response.end("404 Error: Page not found");
});

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});

function printCollection(url,collection) {
    mongo.connect(url,function(error,db){
    if(error) console.error("printCollection:" + error);
    var db1 = db.db("urlshortener");
    var coll = db1.collection(collection);
    coll.find().toArray(function(err,docs){
        if(err) console.error(err);
        console.log(docs);
        db.close();
    });
});
}

printCollection(url,"urls");

mongo.connect(url,function(error,db){
    if(error) console.error(error);
    console.log("Connected");
    var db1 = db.db("urlshortener");
    var urls = db1.collection("urls");
    urls.find({"name":"used ids"},{"_id":0,"available":1}).toArray(function(err,docs){
        if(err) console.error(err);
        console.log("Available: " + Number(docs[0].available));
        db.close();
    });
});