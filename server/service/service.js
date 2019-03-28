const User = require('../model/user');
const Message = require('../model/message');
const EventEmitter = require('events');
const ee = new EventEmitter();

const createMessage = (name, message) => {

    return {
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

module.exports = {
    createMessage,
    historyMessages,
    ee
}