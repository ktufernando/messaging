const WebSocketClient = require('websocket').client;
const { ee } = require('./service/service');
const { getStatusUser } = require('./purecloud/agent');
const { webChatGuestConversation } = require('./purecloud/socket-client');
const ioclient = require('socket.io-client');


let localSocket = new WebSocketClient();


const onMessage = (message) =>{
    
    console.log('Local - Socket - onMessage');
    console.log(message);

    // Chat message
    if (message && message.utf8Data) {

        const data = JSON.parse(message.utf8Data);

        if(data && data.message){
            ee.emit('client-message-in', data.message);
        }
    }
}

ee.on('socket-server-online', ()=>{
    console.log('Local - Socket - localSocketConnection');
   
    const socket = ioclient.connect('http://127.0.0.1:3000', {secure: false, resource: "/socket.io"});
    socket.on('connect', () => {
        console.log(`socket io client connected - local: ${socket.id}`);
        ee.emit('local-connected');
        socket.emit('loginAgent', {systemId: process.env.PURECLOUD_AGENT});
    });
    socket.on('connect_error', (error) => {
        console.log(`socket io client error - local: ${error}`);
    });
    socket.on('connect_timeout', () => {
        console.log(`socket io client timeout - local`);
    });
    socket.on('sendMessage', onMessage );

    ee.on('client-disconnected', async () => {
        console.log('disconnecting local socket');
        socket.disconnect();
    });
    
});

ee.on('client-connected',  async (user) => {
    console.log('on event client-connected');
    //validar que el agente este en linea
    const status = await getStatusUser();
    console.log(`Agent status: ${status}`);
    if(status){
        webChatGuestConversation(user);
    }else{
        ee.emit('agent-offline');
    }
});



