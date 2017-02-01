#nodeMyAdmin

Simple administration tool written in node.js to manage databases in MongoDB.

## ! In very early development stage ! ##

### See what's to come [here](https://trello.com/b/Fsn54yaG/nodemyadmin) ###

Feel free to add suggestions or identify issues in GitHub's Issues manager

__*Simple Mongo Setup Reminder*__

* Get Mongo server running
 * sudo mongod

* Shell Running
 * mongo
 
__*Ending Mongod*__

* In Mongo shell

  `use admin`
  
  `db.shutdownServer()`

__*Starting NodeJS App*__

* node server.js

* *If want a easy way to restart app after changes*

* npm install nodemon

* nodemon server
