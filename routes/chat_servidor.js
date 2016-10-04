var nicks = new Array();
var status = new Array();
var io;

exports.iniciar = function(http){
	io = require('socket.io').listen(http);
	io.sockets.on('connection', function(socket){
		usuarios(socket);
		nick(socket);
		mensaje(socket);
		usuario_desconectado(socket);
		setStatus(socket);
	});
}

function usuarios(socket){
	socket.emit('usuarios', {nicks: nicks, status: status});
	socket.broadcast.emit('usuarios', {nicks: nicks, status: status});
}

function nick(socket){
	socket.on('nick', function(data){
		var nick = data.nick;
		if(nicks.indexOf(nick) == -1){
			nicks.push(nick);
			status.push(1);
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

function usuario_desconectado(socket){
	socket.on('disconnect', function(){
		if(socket.nick){
			nicks.splice(nicks.indexOf(socket.nick), 1);
			status.splice(nicks.indexOf(socket.nick), 1);
			// socket.broadcast.emit('disconnect', {nick: socket.nick});
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