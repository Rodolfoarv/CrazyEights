'use strict';

var mongoose = require('mongoose');
var constants = require('./constants.js');

var gameScheme = mongoose.Schema({
  name: String,
  started: {type: Boolean,
            default: false}

});


//------------------------------------------------------------------------------
module.exports = mongoose.model('Game', gameScheme);
