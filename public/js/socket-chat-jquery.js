var params = new URLSearchParams(window.location.search);

var nombre = params.get('nombre');
var id = params.get('id');


// referencias de jQuery
var divUsuarios = $('#divUsuarios');
var formEnviar = $('#formEnviar');
var txtMensaje = $('#txtMensaje');
var divChatbox = $('#divChatbox');


// Funciones para renderizar usuarios
function renderizarUsuarios(users) { // [{},{},{}]

    console.log(users);

    var html = '';

    html += '<li>';
    html += '    <a href="javascript:void(0)" class="active"> Personas</a>';
    html += '</li>';

    for (var i = 0; i < users.length; i++) {

        html += '<li>';
        if(users[i].online){
            html += '    <a data-id="' + users[i].id + '"  href="javascript:void(0)"><img src="assets/images/users/1.jpg" alt="user-img" class="img-circle"> <span>' + users[i].name + ' <small class="text-success"> online </small></span></a>';
        }else {
            html += '    <a data-id="' + users[i].id + '"  href="javascript:void(0)"><img src="assets/images/users/1.jpg" alt="user-img" class="img-circle"> <span>' + users[i].name + ' <small class="text-warning"> ' + users[i].lastConnection + ' </small></span></a>';
        }
        html += '</li>';
    }

    divUsuarios.html(html);

}


function renderizarMensajes(mensaje, yo) {

    var html = '';
    var fecha = new Date(mensaje.date);
    var hora = fecha.getHours() + ':' + fecha.getMinutes();

    var adminClass = 'info';
    if (mensaje.name === 'Administrador') {
        adminClass = 'danger';
    }

    if (yo) {
        html += '<li class="reverse">';
        html += '    <div class="chat-content">';
        html += '        <h5>' + mensaje.name + '</h5>';
        if(mensaje.sent && !mensaje.delivered){
            html += '        <div class="box bg-light-inverse">' + mensaje.message + '&nbsp;&nbsp;<img src="assets/images/tick.png" alt="sent" style="height:1em"/></div>';
        }
        if(mensaje.delivered){
            html += '        <div class="box bg-light-inverse">' + mensaje.message + '&nbsp;&nbsp;<img src="assets/images/tick.png" alt="sent" style="height:1em" /><img src="assets/images/tick.png" alt="delivered" style="height:1em" /></div>';
        }
        if(!mensaje.sent && !mensaje.delivered){
            html += '        <div class="box bg-light-inverse">' + mensaje.message + '</div>';
        }
        html += '    </div>';
        html += '    <div class="chat-img"><img src="assets/images/users/5.jpg" alt="user" /></div>';
        html += '    <div class="chat-time">' + hora + '</div></div>';
        html += '</li>';

    } else {

        html += '<li class="animated fadeIn">';

        if (mensaje.name !== 'Administrador') {
            html += '    <div class="chat-img"><img src="assets/images/users/1.jpg" alt="user" /></div>';
        }

        
        html += '    <div class="chat-content">';
        html += '        <h5>' + mensaje.name + '</h5>';
        html += '        <div class="box bg-light-' + adminClass + '">' + mensaje.message + '</div>';
        html += '    </div>';
        html += '    <div class="chat-time">' + hora + '</div>';
        html += '</li>';

    }


    divChatbox.append(html);

}

function scrollBottom() {

    // selectors
    var newMessage = divChatbox.children('li:last-child');

    // heights
    var clientHeight = divChatbox.prop('clientHeight');
    var scrollTop = divChatbox.prop('scrollTop');
    var scrollHeight = divChatbox.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight() || 0;

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        divChatbox.scrollTop(scrollHeight);
    }
}




// Listeners
divUsuarios.on('click', 'a', function() {

    var id = $(this).data('id');

    if (id) {
        console.log(id);
    }

});

formEnviar.on('submit', function(e) {

    e.preventDefault();

    if (txtMensaje.val().trim().length === 0) {
        return;
    }

    socket.emit('sendMessage', {
        sender: myself,
        receiver: you,
        message: txtMensaje.val()
    }, function(mensaje) {
        txtMensaje.val('').focus();
        renderizarMensajes(mensaje, true);
        scrollBottom();
    });


});