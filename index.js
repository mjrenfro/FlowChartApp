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


function insertString(db,res,hash_string, callback){
  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    db.collection(current_session.collection).insertOne({key:current_session.key,
      word:current_session.value, json: {key:current_session.key, word:current_session.value}}, function (err, r){

        assert.equal(null, err);
        assert.equal(1, r.insertedCount);
          all_documents(db, {},res);
        db.close();
      });
  });
    callback();
};

function searchString(db,return_val, res,callback){
  const coll=db.get(current_session.collection);
  coll.find({
    "key":current_session.key
  }, "word").then((stuff_found)=>{
      var found_value=stuff_found[0]["word"]
      current_session.value=found_value;
      bundle={previous:found_value};
      all_documents(db, bundle, res);
  });
  callback();
};

var updateString=function(db, new_string, res, callback){
  const coll=db.get(current_session.collection);
  coll.update({key:current_session.key},{$set:{word:new_string}}).then(()=>{
    current_session.value=new_string;
  all_documents(db, {},res);
  });
  callback();
}

function get_dbs(res){
  name_bds=[];

  MongoClient.connect(url, function(err, db){
    var adminDb=db.admin();

    adminDb.listDatabases(function(err, dbs){
      assert.equal(null, err);
      assert.ok(dbs.databases.length>0);
      db.close();
    });
  });
}

//should return only names or the entire obj
function get_collections(res){
  name_colls=[];

  MongoClient.connect(url,function(err, db){
    assert.equal(null, err);
    db.listCollections().toArray(function(err,collInfos){
      for (let coll of collInfos){
          name_colls.push(coll['name']);
      }
            db.close()
            res.render('main', {collections:name_colls});
    });

  });
}

//Could  not find a direct way to create a collection in the MongoDB driver
function createCollection(collection){
  collection.insertOne({a:1}, function(err, r){
    assert.equal(null, err);
    assert.equal(1,r.insertedCount);
  });
  collection.deleteOne({a:1}, function (err, r){
    assert.equal(null, err);
    assert.equal(1,r.deletedCount);
  });
}

function parse_docs(docs, bundle, res){
  docs_bundle=[];
  for (let d of docs){
      docs_bundle.push([d['key'], d['word']]);
  }
  bundle['documents']=docs_bundle;
  res.render('crud',bundle);
}

function deleteDocument(db, res,callback){

  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    const coll=db.collection(current_session.collection);
    coll.deleteOne({key:current_session.key}, function(err, r){
      assert.equal(null, err);
      assert.equal(1, r.deletedCount);
    });

  });
    all_documents(db,{}, res);

}

function delete_collection(res, req){
  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    console.log("CS: ",current_session.collection);

    //gotta love callbacks
    db.collection(current_session.collection).drop(function (err, r){
        //Error checking code
        db.listCollections().toArray(function(err, r){
          var found = false;
          r.forEach(function(document){
            //es no bueno
            if(document.name==current_session.collection){
              found=true;
              return;
            }
          });
          assert.equal(false, found);

          db.close();
        });
        current_session.collection=null;
        get_dbs(res);
        list_names=get_collections(res);


    });


  });


}
/*
  Query the current "session" (still need to implement sessions :( )
  and the update the contents panel, obviously with the contents of the collection
 */
function all_documents(db,bundle, res){

  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    const coll=db.collection(current_session.collection);
    coll.find().toArray(function(err, docs){
        assert.equal(null, err);
        //new collection needs to be made
        if (docs.length ==0){
          createCollection(coll);
        }
        parse_docs(docs, bundle, res)
    });
  });

}
router.get('/', function(req, res){
    get_dbs(res);
    list_names=get_collections(res);
});

router.post('/', function(req, res){
  console.log("delete_coll button: ", req.body.delete_coll);
  if (req.body.delete_coll!=undefined){

    console.log("in delete coll");
    delete_collection(res, req);
  }
  else{
  current_session.collection = typeof req.body.name!="undefined" ? req.body.name :req.body.which_coll;
  console.log("else CS ", current_session.collection);
  all_documents(req.db, {},res);
}
});

router.post('/update', function(req,res){
  var new_word=req.body.found;
  updateString(req.db, new_word, res, function(){
    req.db.close();
  });

});

router.post('/delete', function(req, res){
  deleteDocument(req.db, res, function(){
    req.db.close();
  });
});

router.post('/enter', function (req, res){
  current_session.key = req.body.key;
  current_session.value= req.body.value;

  const hash=crypto.createHmac('sha256', req.body.value).digest('hex');

  insertString(req.db,res,hash, function(){
    req.db.close();
  });

});

//TODO: maybe figure out how to save documents in cache
//so that the MongoDB db doesn't have to queried only on a search...
//Isn't there like a REST solution to this?
//Route for searching for a specific string in DB
router.post('/search', function(req, res){
  current_session.key=req.body.search_value;
  var return_val=[];

  //unsure how to return the found value, so everything
  //is just going to be handled in this funct
  searchString(req.db,return_val, res, function(){
    //TODO: is this necessary?
    req.db.close();
  });

});

module.exports=router;
