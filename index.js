//Is redeclaration of 'globals' really necessary?
var express=require('express');
var router=express.Router();
var mongo=require('mongodb');
var fs = require('fs');
var mustache=require('mustache');

const crypto=require('crypto');

var insertString= function(db, key,value, hash_string, callback){
  const coll=db.get('awesome_words');
  console.log(coll.find());
  coll.insert({
    "key": key,
    "word":value,
    "hashed":hash_string
  });

};
var searchString=function(db, search_string,  return_val, res,callback){
  const coll=db.get('awesome_words');
  coll.find({
    "key":search_string
  }, "word").then((stuff_found)=>{
      html_render({previous:stuff_found[0]["word"]}, res);
  });

};

//TODO: argg...need to learn how template rendering works
var html_render=function(bundle, res){

  var page=fs.readFileSync('form.html', "utf8");
  var html=mustache.to_html(page, bundle);
  res.send(html);

}

router.get('/', function(req, res){
    res.sendFile(__dirname+ '/form.html');
});

router.post('/enter', function (req, res){
  var key = req.body.key;
  var word= req.body.value;

  const hash=crypto.createHmac('sha256', word).digest('hex');

  insertString(req.db, key,word,hash, function(){
    req.db.close();
  });

  //Wrapping up value for mustache and sending it back
  html_render({hashed:hash}, res );

});

//Route for searching for a specific string in DB
router.post('/search', function(req, res){
  var key=req.body.search_value;
  var return_val=[];

  //unsure how to return the found value, so everything
  //is just going to be handled in this funct
  searchString(req.db, key, return_val, res, function(){
    //TODO: is this necessary?
    req.db.close();
  });

});

module.exports=router;
