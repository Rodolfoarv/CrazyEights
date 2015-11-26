'use strict';
const PAUSA = 1000;



$(document).ready(() =>{

  //----------------------------------------------------------------------------
  $('#form_game_name').submit(continueCreateGame);


  $('#btn_continue_create_game').click(continueCreateGame);
  $('#btn_continue_join_game').click(continueJoinGame);
  $('#new_btn').click(showNewModal);
  $('#start_btn').click(waitContrincants);
  $('#join_btn').click(showJoinModal);


  function showNewModal(){
    $('#new_modal').modal();
  }

  function showJoinModal(){
    $('#join_modal').modal();
    $.ajax({
      url: '/crazyEights/existingGames/',
      type: 'GET',
      dataType: 'json',
      error: errorConexion,
      success: result => {
        if (result.length === 0) {
          //There are no available games at this moment
        } else {
          var r = result.map(x => {
            return '<option value="' + x.id + '">' +
              escaparHtml(x.name) + '</option>';
          });
          $('#games').html(r.join('')).selectpicker('refresh');
          }
        }
      });

    //  $('#games')
    //  .html('<option> city1 </option>').selectpicker('refresh');

  }



function waitContrincants(){
  $.ajax({
    url: '/crazyEights/start_game/',
    type: 'PUT',
    dataType: 'json',
    data: {},
    error: errorConexion,
    success: result => {
      console.log(result);
      if (result.start){
        alert('Time to start!');
      }else{
        alert('Not ready yet!');
        //Show the alert
      }
    }
  });

}



  //----------------------------------------------------------------------------
  function continueCreateGame() {
    var name = $('#game_name').val().trim();

    if (name === '') {
      mensajeError('The game name cannot be empty');
    } else {
      console.log('got here');
      $.ajax({
        url: '/crazyEights/createGame/',
        type: 'POST',
        dataType: 'json',
        data: {
          name: name
        },
        error: errorConexion,
        success: result => {
          console.log(result);
          var text;
          if (result.created) {
                $('#main_screen').hide();
                $("#new_modal").modal('hide');
                $('#start_game').toggleClass('hidden');
          } else {
            switch (result.code) {

            case 'duplicated':
              alert('Someone else has created a game with this name');
              // text = 'Alguien más ya creó un juego con este ' +
              //   'name: <em>' + escaparHtml(name) + '</em>';
              break;

            case 'invalid':
              alert('Invalid name');
              // text = 'No se proporcionó un name de juego válido.';
              break;

            default:
              text = 'Error desconocido.';
              break;
            }
            mensajeError(text);
          }
        }
      });
    }
    return false; // Se requiere para evitar que la forma haga un "submit".
  }

  function continueJoinGame(){
    var game_id = $('#games').val();
    $.ajax({
      url: '/crazyEights/joinGame/',
      type: 'PUT',
      dataType: 'json',
      data: { game_id: game_id },
      error: errorConexion,
      success: result => {
        if (result.joined) {
          $('#main_screen').hide();
          $("#join_modal").modal('hide');
          $('#play').toggleClass('hidden');
          // esperaTurno();
        }
      }
    });

  }

    //----------------------------------------------------------------------------
  function mensajeError(mensaje) {
    $('body').css('cursor', 'auto');
    $('div').hide();
    $('#mensaje_error').html(mensaje);
    $('#seccion_error').show();
  }
    // Para evitar inyecciones de HTML.
  function escaparHtml (str) {
    return $('<div/>').text(str).html();
  }

  function errorConexion() {
  mensajeError('No es posible conectarse al servidor.');
  }

  //----------------------------------------------------------------------------
function waitTurn() {

  var segundos = 0;

  $('body').css('cursor', 'wait');
  function ticToc() {
    // $('#mensaje_3').html('Llevas ' + segundos + ' segundo' +
    //   (segundos === 1 ? '' : 's') + ' esperando.');
    console.log('You have been waiting: ', segundos);
    segundos++;
    $.ajax({
      url: '/crazyEights/status/',
      type: 'GET',
      dataType: 'json',
      error: errorConexion,
      success: result => {
        console.log(result);

        switch (result.status) {

        case 'your_turn':
          console.log('My turn');
          turnoTirar(result.tablero);
          break;

        case 'wait':
          setTimeout(ticToc, PAUSA);
          break;

        case 'empate':
          actualizar(result.tablero);
          finDeJuego('<strong>Empate.</strong>');
          break;

        case 'ganaste':
          finDeJuego('<strong>Ganaste.</strong> ¡Felicidades!');
          resalta(result.tablero);
          break;

        case 'perdiste':
          finDeJuego('<strong>Perdiste.</strong> ¡Lástima!');
          actualizar(resultado.tablero);
          resalta(resultado.tablero);
          break;
        }
      }
    });
  };
  setTimeout(ticToc, 0);
};


});
