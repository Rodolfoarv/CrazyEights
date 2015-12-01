'use strict';
const PAUSA = 1000;




$(document).ready(() =>{

  var cardsDragged = 0;

  //----------------------------------------------------------------------------
  $('#form_game_name').submit(continueCreateGame);


  $('#btn_continue_create_game').click(continueCreateGame);
  $('#btn_continue_join_game').click(continueJoinGame);
  $('#btn_continue_classification').click(setClassification);
  $('#new_btn').click(showNewModal);
  $('#start_btn').click(waitContrincants);
  $('#join_btn').click(showJoinModal);
  $('#grab_card').click(grabCard);
  $(document).on('click', '#test', putCard);
  $('#btn_pass').click(pass);

function reset(){
  	$(".player-cards").html("<h2> Your hand </h2> <div class='new-cards'></div>");
    $(".player-cards").css("width","");
}

function pass(){

    function success(){
      $.ajax({
        url: '/crazyEights/status/',
        type: 'GET',
        dataType: 'json',
        error: errorConexion,
        success: result => {
          waitTurn();
          //If end game
        }
      });
    }
    $.ajax({
      url: '/crazyEights/pass_turn/',
      type: 'PUT',
        dataType: 'json',
        error: errorConexion,
        success: result => {
          if (result.done){
          $('#play_game').toggleClass('hidden');
          $('.player-cards .new-cards').empty();
          $('.player-cards').width($('.player-cards').width(0));
          success();
        }else{
        }
        }
    });
  }

  function putCard(){

    function success(){
      $.ajax({
        url: '/crazyEights/status/',
        type: 'GET',
        dataType: 'json',
        error: errorConexion,
        success: result => {
          waitTurn();
          //If end game
        }
      });
    }

    var card = this.className.split(' ');
    var splitCard = card[2].split('-');
    var number = getClassNumber(splitCard[0]);
    var classification = getClassClassification(splitCard[2]);
    var card = number+classification + ' web';

    $.ajax({
      url: '/crazyEights/put_card/',
      type: 'PUT',
      dataType: 'json',
      data: {choice: card},
      error: errorConexion,
      success: result => {
        if (result.done){
          if (result.isEight){
            $('#classification_modal').modal();
            reset();
            /*setLastCard(card[0]+card[1]);
            $('#play_game').toggleClass('hidden');
            success();*/


          }else{
            setLastCard(card[0]+card[1]);
            reset();
            $('#play_game').toggleClass('hidden');
            success();
          }
        }else{
          //Couldn't set any card
        }
      }
    });


  }


  function grabCard(){

    $.ajax({
      url: '/crazyEights/grab_card/',
      type: 'PUT',
      dataType: 'json',
      data: {},
      error: errorConexion,
      success: result => {
        if (result.gotCard === 'accept'){
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

    var newCard = '<div class="cube"><button type="button" id="test" class="btn card ' + card + '"> </button></div>';
    // var id = 'id="1" ';
    // var newCard = " <div " + id + "class='btn card " + card + "'</div>'";
    $('.player-cards .new-cards').append(newCard);
    $('.player-cards').width($('.player-cards').width()+25);


  }

  function setLastCard(card){
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
    // console.log($('#last_card').atrr('class'));
    $('#last_card').attr('class', 'card ' + card);
  }



function waitContrincants(){
  $.ajax({
    url: '/crazyEights/start_game/',
    type: 'PUT',
    dataType: 'json',
    data: {},
    error: errorConexion,
    success: result => {
      if (result.start){
        $('#start_game').hide();
        $('#wait').toggleClass('hidden');
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
              $.ajax({
                url: '/',
                type: 'GET',
                dataType: 'json',
                data: {},
                error: errorConexion,
                success: result => {
                }
              });
              break;

            case 'invalid':
              alert('Invalid name');
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
    return false;
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
          waitTurn();
        }
      }
    });

  }

  function setClassification(){

    function successResult(){
      $.ajax({
        url: '/crazyEights/status/',
        type: 'GET',
        dataType: 'json',
        error: errorConexion,
        success: result => {
          $('#play_game').toggleClass('hidden');
          waitTurn();
          //If end game
        }
      });
    }

      var classification = $('#classification').val();
      $("#classification_modal").modal('hide');
      $.ajax({
        url: '/crazyEights/put_classification/',
        type: 'PUT',
        dataType: 'json',
        data: {classification: classification},
        error: errorConexion,
        success: result => {
          successResult();
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
          $('#wait').toggleClass('hidden');
          $('#play_game').toggleClass('hidden');
          $('#play_title').html('It is your turn: ');
          setLastCard(result.discardMaze[result.discardMaze.length-1]);
          console.log('got everything correct');
          console.log(result.eightClassification);
          if(result.eightClassification.length === 1){
            console.log('gotta update the image!');
          }
          play(result.playerHand);

          break;

        case 'wait':
          $('#wait').toggleClass('hidden');
          $('#wait_title').html('Please wait, it is not your turn yet ');
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

function getClassClassification(classificationString){
  if(classificationString === 'diamonds'){
    return '♠';
  }else if(classificationString === 'hearts'){
    return '♥'
  }else if(classificationString === 'spades'){
    return '♦'
  }else{ //♣
    return '♣';
  }
}

function getClassNumber(num){
  if(num === 'ace'){
    return 'A';
  }else if(num == 'two'){
    return '2';
  }else if(num == 'three'){
    return '3';
  }else if(num == 'four'){
    return '4';
  }else if(num == 'five'){
    return '5';
  }else if(num == 'six'){
    return '6';
  }else if(num == 'seven'){
    return '7';
  }else if(num == 'eight'){
    return '8';
  }else if(num == 'nine'){
    return '9';
  }else if(num == 'ten'){
    return '10';
  }else if(num === 'jack'){
    return 'J';
  }else if(num === 'queen'){
    return 'Q';
  }else if(num === 'king'){
    return 'K';
  }
}


});
