//Is redeclaration of 'globals' really necessary?
var express=require('express');
var router=express.Router();
var mongo=require('mongodb');
var fs = require('fs');
var mustache=require('mustache');
var Session=require("./session");
//session for tracking info between different routes
var current_session=new Session("","");

//for populating the list of collections
var MongoClient=require('mongodb').MongoClient;
var assert=require('assert');
var url='mongodb://localhost:27017/test';

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
  current_session.key=search_string;
  const coll=db.get('awesome_words');
  coll.find({
    "key":search_string
  }, "word").then((stuff_found)=>{
      var found_value=stuff_found[0]["word"]
      current_session.value=found_value;
      html_render({previous:found_value}, res);
  });
};

//TODO: is callback really needed?
var updateString=function(db, new_string, res, callback){
  const coll=db.get('awesome_words');
  coll.update({key:current_session.key},{$set:{word:new_string}}).then(()=>{
    current_session.value=new_string;
    html_render({previous:""},res);
  });

}

//should return only names or the entire obj
function get_collections(db, res,callback){
  name_colls=[];

  MongoClient.connect(url,function(err, db){
    assert.equal(null, err);
    db.listCollections().toArray(function(err,collInfos){
      for (let coll of collInfos){
        console.log("adding names");
        name_colls.push(coll['name']);
      }
            res.render('main', {collections:name_colls});
    });

  });
}

var html_render=function(bundle, res){
  res.render('crud',bundle);
}

router.get('/', function(req, res){
    list_names=get_collections(req.db,res, function(){
      // console.log("router: ", name_colls);
      req.db.close();
      // res.render('main', {collections:name_colls});
    });

});

router.post('/update', function(req,res){
  var new_word=req.body.found;
  updateString(req.db, new_word, res, function(){
    req.db.close();
  });

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
