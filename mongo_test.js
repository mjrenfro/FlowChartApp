
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var OID= require('mongodb').ObjectID;
var url= 'mongodb://localhost:27017/test';
coll_name='Wadsworth';

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
//Call for retrieving all the documents
MongoClient.connect(url, function(err, db){
  assert.equal(null,err);
  console.log("connected to the server properly");
  const coll = db.collection(coll_name);
  coll.find().toArray(function(err, docs){
    assert.equal(null, err);
    console.log("found documents");
    if (docs.length ==0){
        createCollection(db.collection(coll_name));
    }
    db.close();
  });

});
