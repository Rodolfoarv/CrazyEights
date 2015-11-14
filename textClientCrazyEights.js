

/*

*/

'use strict';

//------------------------------------------------------------------------------
var querystring   = require('querystring');
var request       = require('request');

//------------------------------------------------------------------------------
var stdin         = process.stdin;
var stdout        = process.stdout;
var servicioWeb;
const PAUSA       = 1000;          // Milisegundos entre cada petición de espera

//------------------------------------------------------------------------------
// Creador de objetos para invocar servicios web.

function invocadorServicioWeb(host) {

  let cookiesSesion = null;

  //----------------------------------------------------------------------------
  function obtenerCookies(res) {

    let valorSetCookies = res.headers['set-cookie'];

    if (valorSetCookies) {
      let cookies = [];
      valorSetCookies.forEach(str => cookies.push(/([^=]+=[^;]+);/.exec(str)[1]));
      cookiesSesion = cookies.join('; ');
    }
  }

  //----------------------------------------------------------------------------
  function encabezados(metodo) {
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
        headers: encabezados(metodo)
      };
      let qs = querystring.stringify(params);
      if (metodo === 'GET' && qs !== '') {
        opciones.url +=  '?' + qs;
      } else {
        opciones.body = qs;
      }

      request(opciones, (error, res, body) => {
        if (res.statusCode !== 200) {
          errorFatal('Not OK status code (' + res.statusCode + ')');
        }
        obtenerCookies(res);
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

    let gameName = data.toString().trim();

    if (gameName === '') {
      menu();

    } else {
      servicioWeb.invocar(
        'POST',
        '/crazyEights/createGame/',
        {'gameName': gameName},
        result => {

          if (result.created) {
            jugar(result.simbolo);
            return;

          } else if (result.codigo === 'duplicado') {
            printLn();
            printLn('Error: Alguien más ya creó un juego con este ' +
                      'nombre: ' + name);

          } else {
            printLn();
            printLn('No se proporcionó un nombre de juego válido.');
          }

          menu();
        }
      );
    }
  });
}

//------------------------------------------------------------------------------
function errorFatal(mensaje) {
  printLn('ERROR FATAL: ' + mensaje);
  process.exit(1);
}

//------------------------------------------------------------------------------
function esperarTurno(callback) {
  servicioWeb.invocar(
    'GET',
    '/gato/estado/',
    {},
    result => {
      if (result.estado === 'espera') {
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
function jugar(symbol) {

  printLn();
  printLn('Un momento');
  esperarTurno(result => {

    //--------------------------------------------------------------------------
    function tiroEfectuado(tablero) {
      printLn();
      imprimirTablero(tablero);
      servicioWeb.invocar(
        'GET',
        '/gato/estado/',
        {},
        result => {
          if (juegoTerminado(result.estado)) {
            menu();
          } else {
            jugar(symbol);
          }
        }
      );
    }

    //--------------------------------------------------------------------------
    function tiroNoEfectuado() {
      printLn();
      printLn('ERROR: Tiro inválido.');
      jugar(symbol);
    }
    //--------------------------------------------------------------------------

    imprimirTablero(result.tablero);

    if (juegoTerminado(result.estado)) {
      menu();

    } else if (result.estado === 'tu_turno') {
      printLn();
      printLn('Tú tiras con: ' + symbol);
      printLn();
      imprimirPosicionesTablero();
      leerNumero(0, 8, opcion => {
        servicioWeb.invocar(
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
function leerNumero(inicio, fin, callback) {

  imprimir('Selecciona una opción del ' + inicio + ' al ' + fin + ': ');

  stdin.once('data', data => {

    let numeroValido = false;
    let num;

    data = data.toString().trim();

    if (/^\d+$/.test(data)) {
      num = parseInt(data);
      if (inicio <= num && num <= fin) {
        numeroValido = true;
      }
    }
    if (numeroValido) {
      callback(num);
    } else {
      leerNumero(inicio, fin, callback);
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
  leerNumero(1, 3, opcion => {
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
function seleccionarJuegosDisponibles(juegos, callback) {

  let total = juegos.length + 1;

  printLn();
  printLn('¿A qué juego deseas unirte?');
  for (let i = 1; i < total; i++) {
    printLn('    (' + i + ') «' + juegos[i - 1].nombre + '»');
  }
  printLn('    (' + total + ') Regresar al menú principal');
  leerNumero(1, total, opcion => callback(opcion === total ? -1 : opcion - 1));
}

//------------------------------------------------------------------------------
function title() {
  printLn('Crazy Eights Game');
  printLn('© 2013-2015 by Rodolfo Andrés Ramírez Valenzuela, ITESM CEM.');
}

//------------------------------------------------------------------------------
function unirJuego() {

  //----------------------------------------------------------------------------
  function verificarUnion(result) {
    if (result.unido) {
      jugar(result.simbolo);
    } else {
      printLn();
      printLn('No es posible unirse a ese juego.');
      menu();
    }
  }
  //----------------------------------------------------------------------------

  servicioWeb.invocar(
    'GET',
    '/gato/juegos_existentes/',
    {},
    juegos => {
      if (juegos.length === 0) {
        printLn();
        printLn('No hay juegos disponibles.');
        menu();
      } else {
        seleccionarJuegosDisponibles(juegos, opcion => {
          if (opcion === -1) {
            menu();
          } else {
            servicioWeb.invocar(
              'PUT',
              '/gato/unir_juego/',
              { id_juego: juegos[opcion].id },
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
  servicioWeb = invocadorServicioWeb(process.argv[2]);
  menu();
}
