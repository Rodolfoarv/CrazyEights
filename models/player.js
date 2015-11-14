'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var playerScheme = mongoose.Schema({
  game: ObjectId,
});

module.exports = mongoose.model('Player', playerScheme);
