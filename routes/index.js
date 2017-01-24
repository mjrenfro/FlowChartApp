//Is redeclaration of 'globals' really necessary?
var express=require('express');
var router=express.Router();
var mongo=require('mongodb');

var insertString= function(db, input_string, hash_string, callback){
  db.collection('strong_strings').insert({
    "istring":input_string,
    "hash":hash_string
  });

};

var searchString=function(db, search_string, callback){
  var results =db.collection('strong_strings').find({
    "istring":search_string
  });
};

//Landing page
router.get('/', function(req, res){
    res.sendFile(__dirname+ '/form.html')
});

//Route for entering a string in DB
router.get('/enter', function (req, res){
  var value = req.body.input_value;
  //something fun to change the string
  const hash=crypto.createHmac('sha256', value).digest('hex');

  //inserting into database
  var collection=req.db.get('test');
  collection.insert({'istring':value, 'hash':hash});

  //Wrapping up value for mustache and sending it back
  var value_bundle={shifted:hash};
  var page=fs.readFileSync('form.html', "utf8");
  var html= mustache.to_html(page, value_bundle);
  res.send(html);
});

//Route for searching for a specific string in DB
router.get('/search', function(req, res){
  var key=req.body.search_value;

  //search the database
  MongoClient.connect(url, key, function(err, db){
    assert.equal(null, err);
    searchString(db, key, function(){
      db.close();
    });
  });
  var key_bundle={}
});

//redirect the user to the right logic
router.post('/', function(req, res){
  if(req.body.submit_enter) res.redirect('/enter');
  if(req.body.submit_search) res.redirect('/search');

});

module.exports=router;
