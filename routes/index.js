var express = require('express');
var router = express.Router();
var constantes = require('../models/constantes.js');
/* GET home page. */
router.get('/', function(req, res, next) {
  var deck = constantes.crearBaraja();
  console.log(deck);   // imprime el deck antes de revolverlo
  console.log('--------------------------------------');
  var shuffle = constantes.shuffle(deck);
  console.log(shuffle); //imprime el deck una vez que ya se revolvió
  var hand = constantes.draw(shuffle, 5, '', true); //toma 5 cartas, (el deck donde las toma, NO de cartas, la mano, TRUE si es la primera vez que toma)
  console.log(hand);
  res.render('index', { title: 'Express' });
});

module.exports = router;
