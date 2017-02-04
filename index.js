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


var insertString= function(db,res,hash_string, callback){
  // const coll=db.get(current_session.collection);
  // console.log(coll.find());
  // coll.insert({
  //   "key": current_session.key,
  //   "word":current_session.value,
  //   "hashed":hash_string
  // });

  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    db.collection(current_session.collection).insertOne({key:current_session.key,
      word:current_session.value, hashed: hash_string}, function (err, r){

        assert.equal(null, err);
        assert.equal(1, r.insertedCount);
          all_documents(db, res, callback);
        db.close();
      });


  });
    callback();
};



//TODO: error checking for when key is not found

var searchString=function(db,return_val, res,callback){
  console.log("Collection name: ", current_session.collection);
  const coll=db.get(current_session.collection);
  coll.find({
    "key":current_session.key
  }, "word").then((stuff_found)=>{
      var found_value=stuff_found[0]["word"]
      current_session.value=found_value;
      bundle={previous:found_value};

      //have to update the display
      get_all_documents(db, bundle, res);
      // console.log("-------------------");
      // console.log(bundle);
      // console.log("-------------------");
      // html_render(bundle, res);
  });
  callback();
};

//TODO: is callback really needed?
var updateString=function(db, new_string, res, callback){
  const coll=db.get(current_session.collection);
  coll.update({key:current_session.key},{$set:{word:new_string}}).then(()=>{
    current_session.value=new_string;
  all_documents(db, res, callback);
  });
}

function get_dbs(res, callback){
  name_bds=[];

  MongoClient.connect(url, function(err, db){
    var adminDb=db.admin();

    adminDb.listDatabases(function(err, dbs){
      assert.equal(null, err);
      assert.ok(dbs.databases.length>0);
      for (d of dbs.databases){
        console.log(d['name']);
      }
      db.close();
    });
  });

  callback();

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
  // html_render({}, res);
}
//docs, bundle, res
function get_parse_docs(docs, bundle, res){

  console.log("docs: ", docs);


  docs_bundle=[];
  for (let d of docs){
    // console.log(d);
    docs_bundle.push([d['key'], d['word']]);
  }

  bundle['documents']=docs_bundle;
  console.log("########################");
  console.log(bundle);
  console.log("########################");
  html_render(bundle, res);

}
function parse_docs(docs, res){
  docs_bundle=[];
  for (let d of docs){
    console.log(d);
    docs_bundle.push([d['key'], d['word']]);
  }
  html_render({documents:docs_bundle}, res);
}

function deleteDocument(db, res,callback){

  // const coll = db.get(current_session.collection);
  // coll.remove({key:key_value});

  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    const coll=db.collection(current_session.collection);
    coll.deleteOne({key:current_session.key}, function(err, r){
      assert.equal(null, err);
      assert.equal(1, r.deletedCount);
    });

  });
    all_documents(db, res, callback);

}

function delete_collection(res, req){
  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    db.collection(current_session.collection).drop();
    current_session.collection=null;

    get_dbs(res, function(){
      console.log("end of function");

    });
    list_names=get_collections(res, function(){
      console.log("called automatically");
      req.db.close();
    });


  });


}
/*
  Query the current "session" (still need to implement sessions :( )
  and the update the contents panel, obviously with the contents of the collection
 */

 function get_all_documents(db, bundle, res){

   MongoClient.connect(url, function(err, db){
     assert.equal(null, err);
     console.log("connected to the server");
     const coll=db.collection(current_session.collection);
     coll.find().toArray(function(err, docs){
         assert.equal(null, err);
         console.log("no errors with find...but are there docs???");
         //new collection needs to be made
         if (docs.length ==0){
           createCollection(coll);

         }
        get_parse_docs(docs, bundle, res);
     });
   });

 }

function all_documents(db, res, callback){

  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    console.log("connected to the server");
    const coll=db.collection(current_session.collection);
    coll.find().toArray(function(err, docs){
        assert.equal(null, err);
        console.log("no errors with find...but are there docs???");
        //new collection needs to be made
        if (docs.length ==0){
          createCollection(coll);

        }
        parse_docs(docs, res)
    });
  });

  callback();
}
var html_render=function(bundle, res){
  res.render('crud',bundle);
}

router.get('/', function(req, res){
    get_dbs(res, function(){
      console.log("end of function");

    });
    list_names=get_collections(res, function(){
      console.log("called automatically");
      req.db.close();
    });
});

router.post('/', function(req, res){
  console.log("post");
  current_session.collection = typeof req.body.name!="undefined" ? req.body.name :req.body.which_coll;
  console.log(current_session.collection);
  all_documents(req.db, res, function(){
    req.db.close();
  });
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
router.post('/delete_collection', function(req, res){
  delete_collection(res, req);
});
router.post('/enter', function (req, res){
  current_session.key = req.body.key;
  current_session.value= req.body.value;

  const hash=crypto.createHmac('sha256', req.body.value).digest('hex');

  insertString(req.db,res,hash, function(){
    req.db.close();
  });

  //Wrapping up value for mustache and sending it back
  // html_render({hashed:hash}, res );

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
