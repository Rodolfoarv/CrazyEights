'use strict';

// Function that creates the 52 cards deck
function createDeck() {
  var classification = ["♠", "♥", "♦", "♣"];
  var pack = [];
  var n = 52;
  var cardsPerClassification = n / classification.length;
  for (var classificationIndex = 0; classificationIndex < classification.length; classificationIndex++) {
    for (var card = 1; card <= cardsPerClassification; card++) {
      if (card == 1) pack.push('A' + classification[classificationIndex]);
      else if (card == 11) pack.push('J' + classification[classificationIndex]);
      else if (card == 12) pack.push('Q' + classification[classificationIndex]);
      else if (card == 13) pack.push('K' + classification[classificationIndex]);
      else pack.push(card + classification[classificationIndex]);
    }
  }
  return pack;
}

//Function that will shuffle the cards within a deck
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

/*
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
*/

exports.DECK = shuffle(createDeck());
