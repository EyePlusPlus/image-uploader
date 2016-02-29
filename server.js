var express = require('express');
var app = express();
var mongoose = require('mongoose');
var database = require(process.cwd() + '/config/config').mongo_url;
var port = process.env.port || 3000;
var indexCtrl = require(process.cwd() + '/core/controllers').indexCtrl;
var uploadCtrl = require(process.cwd() + '/core/controllers').uploadCtrl;
var galleryCtrl = require(process.cwd() + '/core/controllers').galleryCtrl;

mongoose.connect(database);

app.set('view engine', 'jade');
app.set('views', process.cwd() + '/views');

//Log requests
app.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

//Display form
app.get('/form', indexCtrl);

//Handle form upload
app.post('/form', uploadCtrl);

//Display gallery of images
app.get('/gallery/:uri', galleryCtrl);

app.listen(port);
console.log("Server listening on port", port);