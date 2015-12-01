
'use strict';

//------------------------------------------------------------------------------
var querystring   = require('querystring');
var request       = require('request');

//------------------------------------------------------------------------------
var stdin         = process.stdin;
var stdout        = process.stdout;
var webService;
const PAUSA       = 1000;          // Milisegundos entre cada petición de espera

//------------------------------------------------------------------------------
// Creador de objetos para invocar servicios web.

function invocadorwebService(host) {

  let cookiesSesion = null;

  //----------------------------------------------------------------------------
  function getCookies(res) {

    let valorSetCookies = res.headers['set-cookie'];

    if (valorSetCookies) {
      let cookies = [];
      valorSetCookies.forEach(str => cookies.push(/([^=]+=[^;]+);/.exec(str)[1]));
      cookiesSesion = cookies.join('; ');
    }
  }

  //----------------------------------------------------------------------------
  function headers(metodo) {
    let r = {};
    if (metodo !== 'GET') {
      r['Content-type'] = 'application/x-www-form-urlencoded';
    }
    if (cookiesSesion) {
      r['Cookie'] = cookiesSesion;
    }
    return r;
  }

  return {

    //--------------------------------------------------------------------------
    invocar: (metodo, ruta, params, callback) => {

      let opciones = {
        url: host + ruta,
        method: metodo,
        headers: headers(metodo)
      };
      let qs = querystring.stringify(params);
      if (metodo === 'GET' && qs !== '') {
        opciones.url +=  '?' + qs;
      } else {
        opciones.body = qs;
      }

      request(opciones, (error, res, body) => {
        if (res.statusCode !== 200) {
          fatalError('Not OK status code (' + res.statusCode + ')');
        }
        getCookies(res);
        callback(JSON.parse(body));
      });
    }
  };
}

//-------------------------sdsdsdssDSDSadadS-----------------------------------------------------
function createGame() {

  function waitContrincants(){
    selectHostOptions( option => {
      if (option === -1) {
        menu();
      } else {
        webService.invocar(
          'PUT',
          '/crazyEights/start_game/',
          {},
          result => {
            if (result.start){
              play();
            }else{
              printLn('Unable to start the game');
            }
          }
        );
      }
    });

  }

  printLn();
  imprimir('Type the name of the game:');

  stdin.once('data', data => {

    let name = data.toString().trim();

    if (name === '') {
      menu();

    } else {
      webService.invocar(
        'POST',
        '/crazyEights/createGame/',
        {'name': name},
        result => {
          if (result.created) {
            //Displays a menu that will let the host starts the game or until it is full
            waitContrincants();
            return;

          } else if (result.code === 'duplicated') {
            printLn();
            printLn('Error: Someone has created a game with this ' +
                      'name: ' + name);

          } else {
            printLn();
            console.log(result);
            printLn('Invalid game name, please try again');
          }

          menu();
        }
      );
    }
  });
}

//------------------------------------------------------------------------------
function fatalError(message) {
  printLn('FATAL ERROR: ' + message);
  process.exit(1);
}

//------------------------------------------------------------------------------
function esperarTurno(callback) {
  webService.invocar(
    'GET',
    '/crazyEights/status/',
    {},
    result => {
      if (result.status === 'wait') {
        setTimeout(() => esperarTurno(callback), PAUSA);
      } else {
        printLn();
        callback(result);
      }
    }
  );
}

//------------------------------------------------------------------------------
function imprimir(mens) {
  if (mens !== undefined) {
    stdout.write(mens);
  }
}

//-------------------------------------------------------------------------------
function printMenu() {
  printLn();
  printLn('================');
  printLn(' MAIN MENU: WELCOME TO CRAZY EIGHTS');
  printLn('================');
  printLn('(1) Create a new game');
  printLn('(2) Join a game');
  printLn('(3) Exit');
  printLn();
}

//------------------------------------------------------------------------------
function printLn(mens) {
  if (mens !== undefined) {
    stdout.write(mens);
  }
  stdout.write('\n');
}


//------------------------------------------------------------------------------
function play() {
  esperarTurno(result => {

    //--------------------------------------------------------------------------
    function getCard() {
      printLn();
      webService.invocar(
        'GET',
        '/crazyEights/status/',
        {},
        result => {
            play();

        }
      );
    }

    //--------------------------------------------------------------------------
    function noCard() {
      printLn();
      printLn('ERROR: Could not get any card.');
      play();
    }

    function putCard(){
      webService.invocar(
        'GET',
        '/crazyEights/status/',
        {},
        result => {
            if (endGame(result.status)){
              menu();
            }else{
              play();
            }


        }
      );
    }

    //--------------------------------------------------------------------------
    if (endGame(result.status)) {
      menu();

    } else if (result.status === 'your_turn') {
      printLn();
      printLn('It is your turn, choose an option'); //Menu that displays the options
      selectPlayOptions(option => {
        if (option === -1){
          menu();
        }else if(option === 1){
          //Option that grabs a card from the deck and puts it into the player's hand
          webService.invocar(
            'PUT',
            '/crazyEights/grab_card',
            {},
            result => {
              if (result.gotCard === 'accept'){
                printLn('\n\n<==============<<<=>>>=================>');
                console.log('You got the card: ', result.card);
                printLn('<==============<<<=>>>=================>');
                getCard(result);
              }else if (result.gotCard === 'deckIsEmpty'){
                printLn('You must choose a card from your hand or pass');
                play();
              }else{
                noCard();
              }
            }

          )
        }else if(option === 2){
          printLn('The last card in the stack is: '+ result.discardMaze[result.discardMaze.length-1]);
          selectAvailableCards(result.playerHand, choice => {
            if (choice === -1) {
              play();
            } else {
              webService.invocar(
                'PUT',
                '/crazyEights/put_card',
                {choice: choice},
                result => {
                  if (result.isEight){
                    setClassification();
                  }else{
                    if (result.done){
                      putCard();
                    }else{
                      printLn('ERROR: Could not set any card.');
                      play();
                    }
                  }

                }
              );
            }
          });
        }else{
          webService.invocar(
            'PUT',
            '/crazyEights/pass_turn',
            {},
            result => {
              if (result.done){
                play();
              }else{
                printLn('---------------------------------------------');
                printLn('You cannot pass unless the deck is empty');
                printLn();
                play();
              }
            }
          );
        }
      });
    }
  });
}

function setClassification(){

    selectClassificationOptions( option => {
      if (option === -1) {
        menu();
      } else {
        let classification;
        if (option === 1){
          classification = '♠';
        }else if(option === 2){
          classification = '♥';
        }else if(option === 3){
          classification = '♦';
        }else{
          classification = '♣';
        }
        webService.invocar(
          'PUT',
          '/crazyEights/put_classification/',
          {classification: classification},
          result => {
            webService.invocar(
              'GET',
              '/crazyEights/status/',
              {},
              result => {
                play();
              });
          }
        );
      }
    });
}
function unirJuego() {

  //----------------------------------------------------------------------------
  function verificarUnion(result) {
    if (result.joined) {
      play(result.simbolo);
    } else {
      printLn();
      printLn('It is not possible to join this game at this moment');
      menu();
    }
  }
  //----------------------------------------------------------------------------

  webService.invocar(
    'GET',
    '/crazyEights/existingGames/',
    {},
    games => {
      if (games.length === 0) {
        printLn();
        printLn('There are no available games at this moment');
        menu();
      } else {
        selectAvailableGames(games, option => {
          if (option === -1) {
            menu();
          } else {
            webService.invocar(
              'PUT',
              '/crazyEights/joinGame/',
              { game_id: games[option].id },
              verificarUnion
            );
          }
        });
      }
    }
  );
}

//------------------------------------------------------------------------------
function readOption(start, end, callback) {

  imprimir('Choose an option between ' + start + ' and ' + end + ': ');

  stdin.once('data', data => {

    let validNumber = false;
    let num;

    data = data.toString().trim();

    if (/^\d+$/.test(data)) {
      num = parseInt(data);
      if (start <= num && num <= end) {
        validNumber = true;
      }
    }
    if (validNumber) {
      callback(num);
    } else {
      readOption(start, end, callback);
    }
  });
}

//------------------------------------------------------------------------------
function licencia() {
  console.log('Este programa es software libre: usted puede redistribuirlo y/o');
  console.log('modificarlo bajo los términos de la Licencia Pública General GNU');
  console.log('versión 3 o posterior.');
  console.log('Este programa se distribuye sin garantía alguna.');
}

//------------------------------------------------------------------------------
function menu() {
  printMenu();
  readOption(1, 3, opcion => {
    switch (opcion) {

    case 1:
      createGame();
      break;

    case 2:
      unirJuego();
      break;

    case 3:
      process.exit(0);
    }});
}

//------------------------------------------------------------------------------
function selectAvailableGames(games, callback) {

  let total = games.length + 1;

  printLn();
  printLn('Which game do you wish to join?');
  for (let i = 1; i < total; i++) {
    printLn('    (' + i + ') «' + games[i - 1].name + '»');
  }
  printLn('    (' + total + ') Regresar al menú principal');
  readOption(1, total, opcion => callback(opcion === total ? -1 : opcion - 1));
}

function selectAvailableCards(cards, callback) {

  let total = cards.length + 1;
  console.log(total);
  printLn();
  printLn('Which card do you wish to put on the stack?');
  for (let i = 1; i < total; i++) {
    printLn('    (' + i + ') «' + cards[i - 1] + '»');
  }
  printLn('    (' + total + ') Return to the main menu');
  readOption(1, total, opcion => callback(opcion === total ? -1 : opcion - 1));
}

function selectPlayOptions(callback){
  printLn('<==============<<<=>>>=================>');
  printLn('(1) Pick a card');
  printLn('(2) Put a card into the stack');
  printLn('(3) Pass turn');
  printLn('<==============<<<=>>>=================>');
  readOption(1,3,option => callback(option === 4 ? -1 : option));
}

function selectClassificationOptions(callback){
  printLn('Select a classification');
  printLn('(1) ♠');
  printLn('(2) ♥');
  printLn('(3) ♦');
  printLn('(3) ♣');
  printLn('<==============<<<=>>>=================>');
  readOption(1,4,option => callback(option === 5 ? -1 : option));
}

function selectHostOptions(callback){
  printLn('(1) Start game');
  readOption(1,2,option => callback(option === 2 ? -1 : option));
}

//------------------------------------------------------------------------------
function title() {
  printLn('Crazy Eights Game');
  printLn('© 2015 by Rodolfo Andrés Ramírez Valenzuela, ITESM CEM.');
}

//------------------------------------------------------------------------------
function endGame(status){
    function mens(s) {
    printLn();
    printLn(s);
    return true;
  }

  switch(status){

    case 'win':
      return mens('Congratulations! You have won');

    case 'lose':
      return mens('You have lost! Please try again!');
    default:
      return false;
    }
  }


//------------------------------------------------------------------------------

title();
printLn();
licencia();

if (process.argv.length !== 3) {
  printLn();
  printLn('You must indicate: http://<host name>:<port>');
  process.exit(0);

} else {
  webService = invocadorwebService(process.argv[2]);
  menu();
}
