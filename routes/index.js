'use strict';
var express = require('express');
var router = express.Router();
var mongoose   = require('mongoose');
var constants = require('../models/constants.js');
var Game = require('../models/game.js');
var Player = require('../models/player.js');


const ABORT  = true;


function promisify(fun) {
  return function (/* ... */) {
    return new Promise((resolve, reject) => {
      let args = Array.prototype.slice.call(arguments);
      args.push((err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
      fun.apply(null, args);
    });
  };
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Crazy Eights Game' });
});

router.post('/crazyEights/createGame/', (req,res) => {
  let result = {created: false, code: 'invalid'};
  let name = req.body.name;
  let game;
  let player;

  if (name){
    let find = promisify(Game.find.bind(Game));
    find({name: name, started:false})
    .then(arg => {
      let games = arg[0];
      console.log('these are the games', games);
      if (games.length === 0){
        game = new Game({name: name});
        console.log('Created game');
        let save = promisify(game.save.bind(game));
        return save();
      }else {
        result.code == 'duplicated';
        throw ABORT;
      }
    }).then(_ => {
      player = new Player({
        game: game._id
      });
      console.log('created player', player);
      let save = promisify(player.save.bind(game));
      return save();
    }).then(_ => {
      req.session.id_player = player._id;
      result.created = true;
      result.code = 'correct';
    })
    .catch(err => {
      if (err !== ABORT){
        console.log(err);
      }
    })
    .then (_ => res.json(result));
  }
});

router.get('/crazyEights/existingGames/', (req,res) =>{
  Game
  .find({started:false})
  .sort('name')
  .exec((err,games) => {
    if (err){
      console.log(err);
    }
    res.json(games.map(x => ({ id: x._id, name: x.name})));
  });
});

module.exports = router;
