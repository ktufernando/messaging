const { io } = require('../server');
const User = require('../model/user');
const Message = require('../model/message');
const service = require('../service/service');
const { ee } = require('../service/service');
const { Room } = require('../service/room');
const room = new Room();
let cli;

io.on('connection', (client) => {
    cli = client;

    console.log(`client connected: ${client.toString()}`);

    client.on('loginClient',  async (data) => {

        ee.emit('socket-server-online');

        let user = await User.findOne({systemId: data.id});
        
        if(!user){
            user = new User({
                name: data.name,
                systemId: data.id,
                role: 'CLIENT_ROLE'
            });
        }
        user.online = true;
        user.socketId = client.id;
        user.lastConnection = new Date();
        await user.save();

        room.addUser(user);

        const users = room.getUsers();

        service.historyMessages(user).then(messages => {
            client.emit('historyMessages', messages);
        });

        
        client.emit('roomStatus', users);
        
        ee.emit('client-connected', user);

    });

    client.on('loginAgent',  async (agent) => {
        console.log(`loginAgent: ${agent}`);

        let user = await User.findOne({systemId: agent.systemId});
        
        if(!user){
            user = new User({
                systemId: agent.systemId,
                role: 'AGENT_ROLE'
            });
        }
        user.socketId = client.id;

        user.name = user.name ? user.name : user.systemId;

        await user.save();

        room.addUser(user);

        const users = room.getUsers();

        client.broadcast.emit('roomStatus', users);

        ee.emit('agent-connected', user);

    });

    client.on('sendMessage', async (data, callback) => {

        let message = new Message({
            sender: data.sender._id,
            receiver: data.receiver._id,
            message: data.message
        });
        await message.save();
        let mensaje = service.createMessage(message._id, data.sender.name, data.message);
        client.broadcast.emit('sendMessage', mensaje);
        ee.emit('client-message-in', message);

        callback(mensaje);
    });


    client.on('disconnect', async() => {

        console.log(`Disconecting: ${client.id}`);
        let user = await User.findOne({socketId: client.id});
        console.log(`Disconecting user: ${user}`);
        user.online = false;
        user.lastConnection = new Date();
        await user.save();

        room.deleteUser(user.id);

        //client.broadcast.emit('sendMenssage', service.createMessage('Administrador', `${ user.name } salió`));
        client.broadcast.emit('roomStatus',  room.getUsers());

        if(user.role === 'CLIENT_ROLE'){
            ee.emit('client-disconnected');
        }

    });

    

    


});

ee.on('agent-message-in', (message) => {
    console.log(`on agent message in: ${message}`);
    if(!message){
        return;
    }
    const agent = room.getAgent();
    const c = room.getClient();
    let m = new Message({
        sender: agent._id,
        receiver: room.getClient()._id,
        message
    });
    let mensaje = service.createMessage(m._id, agent.name, message);
    cli.broadcast.emit('sendMessage', mensaje);
    m.save();

});

ee.on('connect-agent', () => {
    cli.broadcast.emit('loginAgent');
});

ee.on('purecloud-connected', () => {
    let agent = room.getAgent();
    if(!agent.online){
        agent.lastConnection = new Date();
        agent.online = true;
        agent.save();
    }

    cli.broadcast.emit('roomStatus', room.getUsers());
});

ee.on('message-delivered', (message) => {

    console.log('*************** message delivered event');
    cli.broadcast.emit('messageDelivered', message);

});





