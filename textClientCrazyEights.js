
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
            play(result.simbolo);
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
        console.log('waiting');
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
function juegoTerminado(estado) {

  function mens(s) {
    printLn();
    printLn(s);
    return true;
  }

  switch (estado) {

  case 'empate':
    return mens('Empate.');

  case 'ganaste':
    return mens('Ganaste. ¡Felicidades!');

  case 'perdiste':
    return mens('Perdiste. ¡Lástima!');

  default:
    return false;
  }
}

//----------------------------dssfgfhkjhljñk--------------------------------------------------
function play(symbol) {

  printLn();
  printLn('One moment please, waiting for people to connect to the game');
  esperarTurno(result => {

    //--------------------------------------------------------------------------
    function getCard() {
      printLn();
      webService.invocar(
        'GET',
        '/crazyEights/status/',
        {},
        result => {
            //grabbed a card
            play(symbol);

        }
      );
    }

    //--------------------------------------------------------------------------
    function noCard() {
      printLn();
      printLn('ERROR: Could not get any card.');
      play(symbol);
    }

    function putCard(choice){
      printLn();
      webService.invocar(
        'GET',
        '/crazyEights/status/',
        {},
        result => {
            //grabbed a card
            if (endGame(result.status)){
              menu();
            }else{
              play(symbol);
            }


        }
      );
    }

    //--------------------------------------------------------------------------
    if (juegoTerminado(result.estado)) {
      menu();

    } else if (result.status === 'your_turn') {
      printLn();
      printLn('It is your turn, choose an option'); //Menu that displays the options
      printLn('Your current hand is: ',result.playerHand);
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
              if (result.gotCard){
                getCard(result);
              }else{
                noCard();
              }
            }

          )
        }else if(option === 2){
          printLn('the last card in the stack is: '+ result.discardMaze[result.discardMaze.length-1]);
          printLn('select a card from your hand to put it on the stack');
          console.log(result.playerHand);

          //Option that will put the card depending if the user has one of to choose
          var stdin = process.openStdin();
          stdin.addListener("data", function(d) {
          let choice = d.toString().trim();
          webService.invocar(
            'PUT',
            '/crazyEights/put_card',
            {choice: choice},
            result => {
              if (result.done){
                putCard(result);
              }else{
                printLn('ERROR: Could not set any card.');
                play(symbol);
              }
            }
          );
          });




        }
      });
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
        printLn('There is no available games at this moment');
        menu();
      } else {
        selectAvailableGames(games, option => {
          if (option === -1) {
            menu();
          } else {
            webService.invocar(
              'PUT',
              '/crazyEights/joinGame/',
              { gameID: games[option].id },
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

function selectPlayOptions(callback){
  printLn('(1) Pick a card');
  printLn('(2) Put a card into the stack');
  readOption(1,3,option => callback(option === 3 ? -1 : option));
}

//------------------------------------------------------------------------------
function title() {
  printLn('Crazy Eights Game');
  printLn('© 2015 by Rodolfo Andrés Ramírez Valenzuela, ITESM CEM.');
}

//------------------------------------------------------------------------------
function endGame(status){
    function mens(s) {
    imprimirNl();
    imprimirNl(s);
    return true;
  }

  switch(status){

    case 'win':
      return mens('Congratulations! You have won');

    case 'perdiste':
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
