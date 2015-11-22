'use strict';
const PAUSA = 1000;

$(document).ready(() =>{

  // $('#btn_create_game').click(continueCreateGame);
  // $('#btn_create_game').click(() =>{
  //   $('div').hide();
  //   $('#nombre_del_juego').val('');
  //   $('#seccion_solicitar_nombre').show();
  // })

  //----------------------------------------------------------------------------
  $('#form_game_name').submit(continueCreateGame);

  $('#btn_continue_create_game').click(continueCreateGame);




  //----------------------------------------------------------------------------
  function continueCreateGame() {
    console.log('got here buddy');
    alert('hola');
    var name = $('#game_name').val().trim();

    if (name === '') {
      mensajeError('The game name cannot be empty');
    } else {
      $.ajax({
        url: '/crazyEights/createGame/',
        type: 'POST',
        dataType: 'json',
        data: {
          name: name
        },
        error: errorConexion,
        success: result => {
          var text;
          if (result.created) {
            $('div').hide();
            // $('#simbolo').html(result.simbolo);
             $('#mensaje_1').html('Esperando a que alguien más se una al ' +
               'juego <strong>' + escaparHtml(name) + '</strong>.');
            // $('#boton_mensajes_regresar_al_menu').hide();
             $('#seccion_mensajes').show();
            // $('#seccion_tablero').show();
            //esperaTurno();
          } else {
            switch (result.code) {

            case 'duplicado':
              text = 'Alguien más ya creó un juego con este ' +
                'name: <em>' + escaparHtml(name) + '</em>';
              break;

            case 'invalido':
              text = 'No se proporcionó un name de juego válido.';
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

});
