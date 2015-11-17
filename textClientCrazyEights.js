
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

//------------------------------------------------------------------------------
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
            console.log('Correct');
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
function imprimirPosicionesTablero() {
  imprimirTablero([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  printLn();
}

//------------------------------------------------------------------------------
function imprimirTablero(t) {
  printLn(' ' + t[0].join(' | '));
  printLn('---|---|---');
  printLn(' ' + t[1].join(' | '));
  printLn('---|---|---');
  printLn(' ' + t[2].join(' | '));
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

//------------------------------------------------------------------------------
function play(symbol) {

  printLn();
  printLn('One moment please, waiting for people to connect to the game');
  esperarTurno(result => {

    //--------------------------------------------------------------------------
    function tiroEfectuado(tablero) {
      printLn();
      imprimirTablero(tablero);
      webService.invocar(
        'GET',
        '/gato/estado/',
        {},
        result => {
          if (juegoTerminado(result.estado)) {
            menu();
          } else {
            play(symbol);
          }
        }
      );
    }

    //--------------------------------------------------------------------------
    function tiroNoEfectuado() {
      printLn();
      printLn('ERROR: Tiro inválido.');
      play(symbol);
    }
    //--------------------------------------------------------------------------

    imprimirTablero(result.tablero);

    if (juegoTerminado(result.estado)) {
      menu();

    } else if (result.status === 'your_turn') {
      printLn();
      printLn('It is your turn, choose an option ' + symbol); //Menu que despliega las opciones
      printLn();
      imprimirPosicionesTablero();
      readOption(0, 8, opcion => {
        webService.invocar(
          'PUT',
          '/gato/tirar/',
          { ren: Math.floor(opcion / 3), col: opcion % 3 },
          result => {
            if (result.efectuado) {
              tiroEfectuado(result.tablero);
            } else {
              tiroNoEfectuado();
            }
          }
        );
      });
    }
  });
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

//------------------------------------------------------------------------------
function title() {
  printLn('Crazy Eights Game');
  printLn('© 2015 by Rodolfo Andrés Ramírez Valenzuela, ITESM CEM.');
}

//------------------------------------------------------------------------------
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
