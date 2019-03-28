const { io } = require('../server');
const User = require('../model/user');
const Message = require('../model/message');
const service = require('../service/service');
const { ee } = require('../service/service');
const { Room } = require('../service/room');
const room = new Room();

io.on('connection', (client) => {

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
            console.log(messages);
            client.emit('historyMessages', messages);
        });

        client.emit('roomStatus', users);
        
        //client.broadcast.emit('sendMenssage', service.createMessage('Administrador', `${ user.name } se unió`));

        //callback(users);

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
        //client.broadcast.emit('sendMenssage', service.createMessage('Administrador', `${ user.name } se unió`));

        ee.emit('agent-connected', user);

    });

    client.on('sendMessage', async (data, callback) => {

        let message = new Message({
            sender: data.sender._id,
            receiver: data.receiver._id,
            message: data.message
        });
        await message.save();
        let mensaje = service.createMessage(data.sender.name, data.message);
        client.broadcast.emit('sendMessage', mensaje);

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

    

    ee.on('agent-message-in', (message) => {
    
        // persistir mensaje


        client.broadcast.emit('sendMenssage', service.createMessage('Agente', message));

    });

    ee.on('connect-agent', () => {
    
        // persistir mensaje


        client.broadcast.emit('loginAgent');

    });


});



