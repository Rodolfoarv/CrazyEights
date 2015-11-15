'use strict';
var express = require('express');
var router = express.Router();
var mongoose   = require('mongoose');
var constants = require('../models/constants.js');
var Game = require('../models/game.js');
var Player = require('../models/player.js');
module.exports = router;
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
      if (games.length === 0){
        game = new Game({name: name});
        console.log('Created game');
        console.log(game.deck);
        let save = promisify(game.save.bind(game));
        return save();
      }else {
        result.code = 'duplicated';
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
      console.log('Sesion is:', req.session);
    })
    .catch(err => {
      if (err !== ABORT){
        console.log(err);
      }
    })
    .then (_ => res.json(result));
  }
});

router.get('/crazyEights/status/', (req,res) => {
  let result = {status: 'error'};
  getGamePlayer(req,(err,game,player) => {

    function deleteGamePlayers () {
      let remove = promisify(player.remove.bind(player));
      delete req.session.id_player;
      remove()
      .then(_ => {
        let find = promisify(Player.find.bind(Player));
        return find({ player: player._id});
      })
      .then(arg => {
        let jugadores = arg[0];
        if (jugadores.length === 0) {
          let remove = promisify(game.remove.bind(game));
          return remove();
        }
      })
      .catch(err => console.log(err))
      .then(_ => res.json(result));
    }

    if (err){
      console.log(err);
      res.json(result);

    }else{
      if (!juego.started){
        result.status = 'wait';
        res.json(result);
      }
    }
  });

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

router.put('/crazyEights/joinGame/', (req,res) => {
  let result = {joined: false, code: 'wrongID'};
  let gameID = req.body.gameID;
  let game;
  let player;
  if (gameID){
    let findOne = promisify(Game.findOne.bind(Game));
    console.log(gameID);
    findOne({_id: gameID})
    .then(arg=> {
      game = arg[0];

      if (game.started){
        throw ABORT;
      }else{
        game.started = true;
        let save = promisify(game.save.bind(game));
        return save();

      }
    }).then(_ => {
      player = new Player({
        game: game._id
      });
      let save = promisify(player.save.bind(player));
      return save();
    })
    .then(_ => {
      req.session.id_jugador = jugador._id;
      result.joined = true;
      result.code = 'good';
      console.log('joined succesfully');

    }).catch(err => {
      if (err !== ABORT){
        console.log(err);
      }
    })
    .then(_ => res.json(result));
  }else{
    res.json(result);
  }
});

function getGamePlayer(req,callback){
  let idPlayer = req.session.id_player;
  let game;
  let player;

  if (idPlayer){
    let findOne = promisify(Player.findOne.bind(Player));
    findOne({ _id: idPlayer})
    .then(arg => {
      player = arg[0];
      let findOne = promisify(Game.findOne.bind(Game));
      return findOne({ _id: player.game})
    }).then(arg => {
      game = arg[0];
    })
    .catch(err => console.log(err))
    .then(_ => callback(null,game,player));
  }else{
    callback(new Error("The session doesn't contain the player's ID"))
  }

}
