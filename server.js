//TODO: organize the routes into a separate file
// Figure out if there is a better way to access the database
var http= require('http');
// var assert = require('assert');
var express = require('express');
var bodyParser=require('body-parser');
var routes=require('./index');

var app=express();

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
//a better way to interface with mongodb
const db= require('monk')('127.0.0.1:27017/test');

//can refer to the db in all the routes
app.use(function(req, res, next){
  req.db=db;
  next();
});

//body-parser is a middle-ware that needs to be explicitly
//configured to be used.
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//custom 404 stuff
//traffic towards to the default address is directed to index
app.use('/', routes);

app.use(function(req,res,next){
  var err=new Error('Ahhhhhhhhh! This page doesn\'t exist now...mah bad');
  err.status=404;
  //finds the next route handler
  next(err);
});

app.listen(1185);
console.log("server listening on 1185");

//required to avoid middle-ware error
module.exports=app;
