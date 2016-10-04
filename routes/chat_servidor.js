var nicks = new Array();
var status = new Array();
var basket = new Array();
var io;

exports.iniciar = function(http){
	io = require('socket.io').listen(http);
	io.sockets.on('connection', function(socket){
		usuarios(socket);
		nick(socket);
		mensaje(socket);
		usuario_desconectado(socket);
		setStatus(socket);
		sendWhisper(socket);
	});
}

function usuarios(socket) {

	socket.emit('usuarios', {nicks: nicks, status: status});
	socket.broadcast.emit('usuarios', {nicks: nicks, status: status});

}

function nick(socket){
	socket.on('nick', function(data){
		var nick = data.nick;
		if(nicks.indexOf(nick) == -1){
			nicks.push(nick);
			status.push(1);
			basket.push(socket.id);
			socket.nick = nick;
			socket.emit('nick', {correcto: true, nick: nick});
			socket.broadcast.emit('nuevo_usuario', {nick: nick});
			usuarios(socket);
		}else{
			socket.emit('nick', {correcto: false, nick: nick});
		}
	});
}

function mensaje(socket){
	socket.on('mensaje', function(data){
		if(socket.nick){
			var mensaje = data.mensaje;
			var nick = socket.nick;
			socket.broadcast.emit('mensaje', {mensaje: mensaje, nick: nick});
		}
		
	});
}

function usuario_desconectado(socket) {

	socket.on('disconnect', function() {

		if(socket.nick) {

			var index = nicks.indexOf(socket.nick);

			nicks.splice(index, 1);
			status.splice(index, 1);
			basket.splice(index, 1);

			socket.broadcast.emit('disconnectUser', {nick: socket.nick});
			usuarios(socket);
		}

	});
	
}

function setStatus(socket) {

	socket.on('setStatus', function(data) {
		
		if(socket.nick) {
			var s = data.status;
			var nick = socket.nick;
			status[nicks.indexOf(nick)] = s;
			socket.broadcast.emit('setStatus', {status: s, nick: nick});
		}
		
	});
}

function sendWhisper(socket) {

	socket.on('sendWhisper', function(data) {
		
		if(socket.nick) {

			var socketid = basket[nicks.indexOf(data.whisperto)];
			var whisperfrom = socket.nick;
			var message = data.message;

			io.sockets.connected[socketid].emit('receiveWhisper', {message: message, whisperfrom: whisperfrom});

		}
		
	});
}