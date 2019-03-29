const User = require('../model/user');
const Message = require('../model/message');
const EventEmitter = require('events');
const ee = new EventEmitter();

const createMessage = (id, name, message) => {

    return {
        id,
        name,
        message,
        date: new Date().getTime()
    };

}

const historyMessages = async (user) => {

    let agent = await User.findOne({systemId: process.env.PURECLOUD_AGENT});

    const clientMessages = await Message.find({sender: user._id, receiver: agent._id});
    const agentMessages = await Message.find({sender: agent._id, receiver: user._id});
    let messages = {
        client: clientMessages,
        agent: agentMessages 
    }

    return messages;
}

const getClientSentMessages = async(user) => {

    let agent = await User.findOne({systemId: process.env.PURECLOUD_AGENT});

    return await Message.find({sender: user._id, receiver: agent._id, delivered: false});
}

const messageDelivered = async(message) => {
    message.delivered = true;
    message.save();
    console.log('********************** mark as delivered');
    ee.emit('message-delivered', message);
}



module.exports = {
    createMessage,
    historyMessages,
    getClientSentMessages,
    messageDelivered,
    ee
}