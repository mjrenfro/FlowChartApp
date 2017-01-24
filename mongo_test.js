var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var OID= require('mongodb').ObjectID;
var url= 'mongodb://localhost:27017/test';

//trying out inserting a document

//the method to be called by the mongoclient obj

var insertDocument= function(db, callback){
  db.collection('restaurants').insertOne({
    "address":{
      "street": "2 Avenue",
      "zipcode" :"10075",
      "building":"1480",
      "coord":[-73.9557413, 40.7720266],

    },
    "borough":"Manhattan",
    "cuisine":"Italian",
    "grades" :[
      {
        "date" :new Date("2014-10-0T00:00:00Z"),
        "grade" : "A",
        "score":11,

      },
      {
        "date": new Date("2014-01016T00:00:00Z"),
        "grade":"B",
        "score" :17
      }
    ],
    "name":"Vella",
    "restaurant_id":"41704620"
  },function(err, result){
    assert.equal(err, null);
    console.log("Inserted a document into the restaurants collections.");
    callback();
  });

};

//Call the inserting method
MongoClient.connect(url, function(err, db){
  assert.equal(null, err);
  insertDocument(db, function(){
    db.close();
  });
});
