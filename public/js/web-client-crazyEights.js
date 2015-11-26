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
  $('#grab_card').click(grabCard);

  function grabCard(){
    $.ajax({
      url: '/crazyEights/grab_card/',
      type: 'PUT',
      dataType: 'json',
      data: {},
      error: errorConexion,
      success: result => {
        if (result.gotCard === 'accept'){
          //Get card
          console.log(result);
          getCard(result.card);


        }else if(result.gotCard === 'deckIsEmpty'){
          console.log('Deck is empty');
        }else{
          //Error, no card
          $('#start_alert').toggleClass('hidden');
        }
      }
    });

  }


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

  function play(hand){
    console.log(hand);
    for (var i = 0; i < hand.length; i++) {
      getCard(hand[i]);
    }

  }

  function getCard(card){
    var splitCard = card.split('');
    if (splitCard.length === 2){
      var value = getNumber(splitCard[0]);
      var classification = getClassification(splitCard[1]);
      var card = value+classification;
    }else{
      var value = 'ten';
      var classification = getClassification(splitCard[2]);
      var card = value+classification;
    }
    var newCard = "<div class='btn card " + card + "'</div>'";
    $('.player-cards .new-cards').append(newCard);
    $('.player-cards').width($('.player-cards').width()+84);
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
        $('#start_game').hide();
        waitTurn();
      }else{
        //Error, cannot start the game
        $('#start_alert').toggleClass('hidden');
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
          $("#join_modal").modal('hide');
          waitTurn();
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
  var seconds = 0;
  function ticToc() {

    seconds++;
    // $('#mensaje_3').html('Llevas ' + seconds + ' segundo' +
    //   (seconds === 1 ? '' : 's') + ' esperando.');
    $.ajax({
      url: '/crazyEights/status/',
      type: 'GET',
      dataType: 'json',
      error: errorConexion,
      success: result => {

        switch (result.status) {

        case 'your_turn':
        console.log('my turn');
          $('#play_game').toggleClass('hidden');
          $('#play_title').html('It is your turn: ');
          play(result.playerHand);
          break;

        case 'wait':
          console.log(seconds);
          setTimeout(ticToc, PAUSA);
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

function getClassification(symbol){
  if(symbol === '♠'){
    return '-of-diamonds';
  }else if(symbol === '♥'){
    return '-of-hearts'
  }else if(symbol === '♦'){
    return '-of-spades'
  }else{ //♣
    return '-of-clubs'
  }
}

function getNumber(num){
  if(num === 'A'){
    return 'ace';
  }else if(num == 2){
    return 'two';
  }else if(num == 3){
    return 'three';
  }else if(num == 4){
    return 'four';
  }else if(num == 5){
    return 'five';
  }else if(num == 6){
    return 'six';
  }else if(num == 7){
    return 'seven';
  }else if(num == 8){
    return 'eight';
  }else if(num == 9){
    return 'nine';
  }else if(num == 10){
    return 'ten';
  }else if(num === 'J'){
    return 'jack';
  }else if(num === 'Q'){
    return 'queen';
  }else if(num === 'K'){
    return 'king';
  }
}


});
