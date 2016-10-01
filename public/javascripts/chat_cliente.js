var socket = io.connect('http://localhost:3000');

//Recibir los usuarios conectados
socket.on('usuarios', function(data){
	var nicks = data.nicks;
	$("#usuarios").html('');
	for (var i=0; i< nicks.length; i++){
		$("#usuarios").append('<li>' + nicks[i] + '</li>');
	}
});

//Enviar el nick para registrarlo al chat
$("#form_nick [type='submit']").click(function(){
	var nick = $("#nick").val();
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
});
//Espera los mensajes nuevos del servidor
socket.on('mensaje', function(data){
	$("#mensajes").append('<p> '+ data.nick + ': '+ data.mensaje + '</p>').scrollTop($("#mensajes").height());
});

//Se dispara cada vez que el usuario se desconecta
socket.on('disconnect', function(data){
	$("#mensajes").append('<p style="color: #f00"> ' + data.nick + ' se ha desconectado </p>').scrollTop($("#mensajes").height());
});