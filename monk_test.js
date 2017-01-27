const monk = require('monk')

// Connection URL
const url = 'localhost:27017/test';

const db = monk(url);

const collection=db.get('awesome_words');

collection.find().then((stuff_found) => {
  console.log('Connected correctly to server');
  console.log(stuff_found);

});
// collection.update({key:'Drug'},{$set:{word:'Modafinil'}}).then(()=>{
//   console.log('Successfully updated a value');
// });
// .then(()=>db.close())
