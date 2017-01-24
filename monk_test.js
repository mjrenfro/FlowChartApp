const monk = require('monk')

// Connection URL
const url = 'localhost:27017/test';

const db = monk(url);

const collection=db.get('awesome_words');

collection.find({'word':'pantene'}, 'hashed').then((stuff_found) => {
  console.log('Connected correctly to server');
  console.log(stuff_found[0]['hashed']);

}).then(()=>db.close())
