var express = require('express');
var router = express.Router();

function promisify(fun) {
  return function (/* ... */) {
    return new Promise((resolve, reject) => {
      let args = Array.prototype.slice.call(arguments);
      args.push((err, ...result) => {
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
  let result = {created: false, code: invalid};
  let gameName = req.body.gameName;
  let game;
  let player;

  if (gameName){
    let find = promisify(Game.find.bind(Game));
    find({gameName: gameName, started:false})
    .then(arg => {
      let games = arg[0];
    })
  }
});

module.exports = router;
