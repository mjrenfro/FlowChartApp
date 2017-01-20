//The most basic node.js app
//Inspired by tutorials at
//#https://www.sitepoint.com/creating-and-handling-forms-in-node-js/
//#http://devcrapshoot.com/javascript/nodejs-expressjs-and-mustachejs-template-engine
//required for using the http server and client
var http= require('http');
var fs = require('fs');
//don't need this module if using express js
//var formidable = require("formidable");
var util = require('util');
var express = require('express');
var mustache=require('mustache');
var bodyParser=require('body-parser');

var app=express();

//body-parser is a middle-ware that needs to be explicitly
//configured to be used.
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('view engine', 'mustache');
app.get('/', function(req, res){
    //displayForm(res);
    res.sendFile(__dirname+ '/form.html')

});

app.post('/', function(req, res){
  var value={shifted:req.body.test_value};

  var page=fs.readFileSync('form.html', "utf8");
  var html= mustache.to_html(page, value);
  res.send(html);


});


//Handling the user input
function processAllFieldsOfTheForm(req, res){
  //formidable is a module to parse the "form" data
  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files){
    res.writeHead(200, {
      'content-type':'text/plain'
    });
    res.write('received the data:\n\n');
    res.end(util.inspect({
        fields: fields,
        files: files
    }));

  });
}
app.listen(1185);
console.log("server listening on 1185");
