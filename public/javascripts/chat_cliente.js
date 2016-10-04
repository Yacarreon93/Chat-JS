var socket = io.connect('http://localhost:3000');

//Recibir los usuarios conectados
socket.on('usuarios', function(data){
	var nicks = data.nicks;
	var status = data.status;
	var s = '';
	$("#usuarios").html('');
	for (var i=0; i< nicks.length; i++){

		if (status[i] == 1) {
			s = 'active';
		} else if (status[i] == 2) {
			s = 'busy';
		} else {
			s = 'inactive';
		}

		$("#usuarios").append('<li nickname="' + nicks[i] + '"><div class="circle ' + s + '"></div>' + nicks[i] + '</li>');
	}
});

//Enviar el nick para registrarlo al chat
$("#form_nick [type='submit']").click(function(){
	var nick = $("#nick").val();
	$("#my_session").html('<h3 class="subtitle">' + nick + '</h3>');
	$("#my_session").append('<input type="hidden" name="my_nick" value="' + nick + '">');
	$("#caja3").show();
	socket.emit('nick',{nick: nick});
});

//Validar si existe o no el nick
socket.on('nick', function(data){
	if(data.correcto){
		$("#mensajes").append('<p style="color: #00f"> Bienvenido/a ' + data.nick + ' </p>').scrollTop($("#mensajes").height());
		$("#form_nick").hide();
		$("#mensajes, #form_mensaje").show();
	}else{
		alert('Ya existe el usuario con el nombre de: '+ data.nick);
	}
});

//Verificar cada vez que un usuario se conectados
socket.on('nuevo_usuario', function(data){
	$("#mensajes").append('<p style="color: #00f"> ' + data.nick + 'se ha conectado </p>').scrollTop($("#mensajes").height());
	$("#mensajes").val('');
});

//Enviamos los mensaje al servidor
$("#form_mensaje [type='submit']").click(function(){
	var mensaje = $("#mensaje").val();
	socket.emit('mensaje', {mensaje: mensaje});
	$("#mensajes").append('<p style="font-weight: bold;"> YO: ' + mensaje + ' </p>').scrollTop($("#mensajes").height());
	$("#mensajes").val('');
	$("#mensaje").val('');
});
//Espera los mensajes nuevos del servidor
socket.on('mensaje', function(data){
	$("#mensajes").append('<p> '+ data.nick + ': '+ data.mensaje + '</p>').scrollTop($("#mensajes").height());
});

//Se dispara cada vez que el usuario se desconecta
socket.on('disconnect', function(data){
	$("#mensajes").append('<p style="color: #f00"> ' + data.nick + ' se ha desconectado </p>').scrollTop($("#mensajes").height());
});

// Change user status
$("#form_status [type='submit']").click(function() {

	var status = $("select[name='status_id']").val();
	socket.emit('setStatus', {status: status});

	switch(status) {

		case '1': status = 'active'; 
				break;
		case '2': status = 'busy'; 
				break;
		case '3': status = 'inactive'; 
				break;
		default: status = 'unknown';
	}

	$("#mensajes").append('<p class="' + status + '"> YO have changed to ' + status + '</p>').scrollTop($("#mensajes").height());

	$("#usuarios li").each(function() {		

		if($(this).attr("nickname") == $('input[name="my_nick"]').val()) {

			$(this).children(":first").removeClass("active");
			$(this).children(":first").removeClass("busy");
			$(this).children(":first").removeClass("inactive");
			$(this).children(":first").addClass(status);

		}

	});

});

// Change user status from server
socket.on('setStatus', function(data) {

	var status = data.status;

	switch(status) {

		case '1': status = 'active'; 
				break;
		case '2': status = 'busy'; 
				break;
		case '3': status = 'inactive'; 
				break;
		default: status = 'unknown';
	}	

	$("#mensajes").append('<p class="' + status + '"> '+ data.nick + ' has changed to '+ status + '</p>').scrollTop($("#mensajes").height());

	$("#usuarios li").each(function() {	

		if($(this).attr("nickname") == data.nick) {		

			$(this).children(":first").removeClass("active");
			$(this).children(":first").removeClass("busy");
			$(this).children(":first").removeClass("inactive");
			$(this).children(":first").addClass(status);

		}

	});

});

$("#usuarios").on("click","li", function() {

 	var whisperto = $(this).attr("nickname");

 	$("#whisper").show();	
 	$("#whisper").html("Whisper to " + whisperto + ": ");
 	$("#form_whisper").show();
 	$("#whisperto").val(whisperto);

});

$("#form_whisper [type='submit']").click(function() {

	var whisperto = $("#whisperto").val();
	var message = $("#whispermessage").val();	

	socket.emit('sendWhisper', {message: message, whisperto: whisperto});

	$("#whisperto").val('');
	$("#whispermessage").val('');

	$("#whisper").hide();
	$("#form_whisper").hide();

});

socket.on('receiveWhisper', function(data) {

	$("#mensajes").append('<p style="color:#9600CD"> ' + data.whisperfrom + ' has sent a whisper to you: ' + data.message + '</p>').scrollTop($("#mensajes").height());
	
});

$(document).ready(function() {

	$("#caja3").hide();
	$("#whisper").hide();
	$("#form_whisper").hide();		

});
