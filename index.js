//Is redeclaration of 'globals' really necessary?
var express=require('express');
var router=express.Router();
var mongo=require('mongodb');
var fs = require('fs');
var mustache=require('mustache');
var Session=require("./session");
//session for tracking info between different routes
var current_session=new Session("","","");

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

//for populating the list of collections

var assert=require('assert');
var url='mongodb://localhost:27017/test';

const crypto=require('crypto');

var insertString= function(db, key,value, hash_string, callback){
  const coll=db.get(current_session.collection);
  console.log(coll.find());
  coll.insert({
    "key": key,
    "word":value,
    "hashed":hash_string
  });
};

var searchString=function(db, search_string,  return_val, res,callback){
  current_session.key=search_string;
  const coll=db.get(current_session.collection);
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
  const coll=db.get(current_session.collection);
  coll.update({key:current_session.key},{$set:{word:new_string}}).then(()=>{
    current_session.value=new_string;
    html_render({previous:""},res);
  });
}

//should return only names or the entire obj
function get_collections(res,callback){
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
  callback();
}
function render_docs (res, docs){
  console.log(docs);
  html_render({}, res);
}
function all_documents(db,collection, res, callback){
  const coll=db.get(collection);
  coll.find().then((all_records)=>{
    render_docs(res, all_records);
  });
  callback();
}
var html_render=function(bundle, res){
  res.render('crud',bundle);
}

router.get('/', function(req, res){
    list_names=get_collections(res, function(){
      console.log("called automatically");
      req.db.close();
    });
});

router.post('/', function(req, res){
  //get which collection was selected
  current_session.collection=req.body.which_coll;
  console.log(req.body.which_coll);
  all_documents(req.db, req.body.which_coll, res, function(){
    req.db.close();
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
