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


function insertString(db,res,hash_string){
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
};

function searchString(db,return_val, res,callback){
  MongoClient.connect(url, function(err, db){
      assert.equal(null, err);
      const coll=db.collection(current_session.collection);
      coll.findOne({key:current_session.key}, function(err,doc){
        assert.equal(null, err);
        current_session.value=doc.word;
        bundle ={previous:doc.word};
        all_documents(db, bundle, res);
        callback();
      });
    });
}

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
            res.render('choose_coll', {collections:name_colls});
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
//testing for bootstrap
router.post('/test_bts', function(req, res){
    res.render('test_fade_in');
});
router.get('/', function(req, res){
    // get_dbs(res);
    // list_names=get_collections(res);
    res.render('test_fade_in');
});

//abstract these two functs into something beter
router.post('/add_coll', function(req, res){
  current_session.collection=req.body.name;
  all_documents(req.db, {}, res);
});
router.post('/choose_coll', function(req, res){
  current_session.collection=req.body.which_coll;
  all_documents(req.db, {}, res);
});

// router.post('/', function(req, res){
//   //testing if in the examine collection
//   //view the delete button is selected
//   if (req.body.delete_coll!=undefined){
//
//     console.log("in delete coll");
//     delete_collection(res, req);
//   }
//   else{
//   current_session.collection = typeof req.body.name!="undefined" ? req.body.name :req.body.which_coll;
//   all_documents(req.db, {},res);
// }
// });

router.post('/', function(req, res){
  if(req.body.delete_coll!=undefined)
    delete_collection(res,req);

  if (typeof req.body.choose!= 'undefined'){
        get_collections(res);
  }
  else{
      res.render('add_coll');
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
  insertString(req.db,res,hash);

});

router.post('/search', function(req, res){
  current_session.key=req.body.search_value;
  var return_val=[];
  searchString(req.db,return_val, res, function(){
    req.db.close();
  });

});

module.exports=router;
