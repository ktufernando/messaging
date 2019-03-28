var socket = io();

var params = new URLSearchParams(window.location.search);
var users, myself, you;

if (!params.has('nombre') || !params.has('id')) {
    window.location = 'index.html';
    throw new Error('El nombre y el id son necesarios');
}

var usuario = {
    name: params.get('nombre'),
    id: params.get('id')
};



socket.on('connect', function() {
    console.log('Conectado al servidor');

    socket.emit('loginClient', usuario, function(resp) {
        //actualizarEstados(resp);
    });

});

// escuchar
socket.on('disconnect', function() {

    console.log('Perdimos conexión con el servidor');

});


// Enviar información
// socket.emit('crearMensaje', {
//     nombre: 'Fernando',
//     mensaje: 'Hola Mundo'
// }, function(resp) {
//     console.log('respuesta server: ', resp);
// });

// Escuchar información
socket.on('historyMessages', function(mensajes) {

    let allMessages = mensajes.client.concat(mensajes.agent);

    allMessages.sort((a,b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0));


    allMessages.forEach(e => {
        renderizarMensajes(
            {
                name:  e.sender.id === myself.id? myself.name : you.name, 
                message: e.message, 
                date: e.date,
                sent: e.sent,
                delivered: e.delivered
            }, 
            e.sender.id === myself.id);
        scrollBottom();
    });

    
});

// Escuchar información
socket.on('sendMessage', function(mensaje) {
    // console.log('Servidor:', mensaje);
    renderizarMensajes(mensaje, false);
    scrollBottom();
});

// Escuchar cambios de usuarios
// cuando un usuario entra o sale del chat
socket.on('roomStatus', function(o) {
    actualizarEstados(o);
});

function actualizarEstados (resp){
    console.log('Usuarios conectados', resp);
    users = resp;
    for(var i in users){
        if(params.get('id') === users[i].systemId){
            myself = users[i];
        }else{
            you = users[i];
        }
    }
    renderizarUsuarios(users);
}


// Mensajes privados
socket.on('mensajePrivado', function(mensaje) {

    console.log('Mensaje Privado:', mensaje);

});

