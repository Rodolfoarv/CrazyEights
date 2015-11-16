'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var playerScheme = mongoose.Schema({
  game: ObjectId,
  hand: {type: Array,
         default: []},
  turn: Number
});
//-------------------------------------------------------------------------------

playerScheme.methods.withdrawCard = function (deck){

}

//-------------------------------------------------------------------------------

module.exports = mongoose.model('Player', playerScheme);
