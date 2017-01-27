var Promise =require('bluebird');
var MongoClient = Promise.promisifyAll(require('mongodb').MongoClient);
var assert = require('assert');
var OID= require('mongodb').ObjectID;
var url= 'mongodb://localhost:27017/test';


//Call the inserting method
MongoClient.connectAsync(url).then(function(db){
  names=db.listCollections();
  console.log(names);


}).catch(function(err){
  console.log(err);
});

// db.close();
