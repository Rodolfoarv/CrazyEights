'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

//-------------------------------------------------------------------------------
var esquemaJugador = mongoose.Schema({
  juego:    ObjectId,
  simbolo:  String,
  turno:    Number
});

//-------------------------------------------------------------------------------
module.exports = mongoose.model('Jugador', esquemaJugador);
