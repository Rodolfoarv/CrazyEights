'use strict';

function crearBaraja() {
  var palos = ["♠", "♥", "♦", "♣"];
  var pack = [];
  var n = 52;
  var index = n / palos.length;

  var count = 0;
for(var i = 0; i <= 3; i++)
    for(var j = 1; j <= index; j++){
        if(j == 1)
          pack.push('A' + palos[i]);
        else if(j == 11)
        pack.push('J' + palos[i]);
        else if(j == 12)
        pack.push('Q' + palos[i]);
        else if(j == 13)
        pack.push('K' + palos[i]);
        else
          pack.push(j + palos[i]);
    }


  return pack;
}

function shuffle(pack) {
  var i = pack.length, j, tempi, tempj;
  if (i === 0) return false;
  while (--i) {
     j = Math.floor(Math.random() * (i + 1));
     tempi = pack[i];
     tempj = pack[j];
     pack[i] = tempj;
     pack[j] = tempi;
   }
  return pack;
}

function draw(pack, amount, hand, initial) {
  var cards = new Array();
  cards = pack.slice(0, amount);

  pack.splice(0, amount);

  if (!initial) {
    hand.push.apply(hand, cards);
    //hand.concat(hand);
  }

  return cards;
}


exports.crearBaraja = crearBaraja;
exports.shuffle = shuffle;
exports.draw = draw;
exports.TABLERO_EN_BLANCO = [[' ', ' ', ' ', ' ', ' ']];
