'use strict';

var mongoose = require('mongoose');
var constants = require('./constants.js');

var gameScheme = mongoose.Schema({
  name: String,
  started: {type: Boolean,
            default: false},
  deck: {type: Array,
         default: constants.DECK },
  discardMze: {type: Array,
               default: []},
  slotsOpen: {type: Number,
            default: 5, min: 0},
  playersInGame: {type: Number,
            default: 0, max: 5},
  turn: {type: Number,
        default: 1, min: 1, max:5}
});


//------------------------------------------------------------------------------
module.exports = mongoose.model('Game', gameScheme);
