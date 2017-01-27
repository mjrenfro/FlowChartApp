var MongoClient = require('mongodb').MongoClient;
var url='mongodb://localhost:27017/test';
MongoClient.connect(url)
  .then(function(db){
    console.log(db)
  }).catch(function(err) {
    console.log(err)
  })
