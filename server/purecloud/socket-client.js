const platformClient = require('purecloud-guest-chat-client');
const WebSocketClient = require('websocket').client;
const { ee } = require('../service/service');
const service = require('../service/service');
const Message = require('../model/message');

const client = platformClient.ApiClient.instance;
let chatInfo, clientConnected, deliver;
let messagesDelivered = [];
let socket = new WebSocketClient();

// Create API instance
const webChatApi = new platformClient.WebChatApi();

const onMessage = (message) =>{
    
    if (message && message.utf8Data) {

        const metadata = JSON.parse(message.utf8Data).metadata;

        if(metadata && metadata.type){

            switch (metadata.type) {
                case 'message':
                    {
                        const eventBody = JSON.parse(message.utf8Data).eventBody;
                        console.log(message.utf8Data);
                        if(deliver !== eventBody.sender.id && !messagesDelivered.includes(eventBody.id)){
                            const body = eventBody.body;
                            console.log(`Handle message from agent: ${body}`);
                            ee.emit('agent-message-in', body);
                            messagesDelivered.push(eventBody.id);
                        }
                        break;
                    }
                case 'member-change':
                    {
                        // Handle member state change
                        console.log(' Handle member state change');
                        break;
                    }
                default:
                    {
                        console.log('Unknown message type: ' + metadata.type);
                    }
            }
        }
    }
}

const webChatGuestConversation = async(user) => {

    console.log('Purecloud - Socket - webChatGuestConversation');
    console.log('Intentando conexion con PureCloud');

    clientConnected = user;
    const createChatBody = {
        organizationId: process.env.PURECLOUD_ORG_ID,
        deploymentId: process.env.PURECLOUD_DEPLOY_ID,
        routingTarget: {
            targetType: 'QUEUE',
            targetAddress: 'QU_BBVA_DIRECT',
        },
        memberInfo: {
            displayName: user.name,
            profileImageUrl: 'https://www.iconsdb.com/icons/preview/gray/guest-xxl.png',
            customFields: {
                firstName: user.name
            }
        }
    };

    webChatApi.postWebchatGuestConversations(createChatBody).then((createChatResponse) => {
        console.log(`postWebchatGuestConversations response: ${createChatResponse}`);


        // Store chat info
        chatInfo = createChatResponse;

        // Set JWT
        client.setJwt(chatInfo.jwt);

        console.log('Purecloud - Socket - purecloudSocketConnection');

        socket.on('connectFailed', function (error) {
            console.log('`socket io client error - PureCloud: ' + error.toString());
        });
        socket.on('connect', function (connection) {
            console.log(`socket io client connected - PureCloud`);
            ee.emit('purecloud-connected');

            // Listen for messages
            connection.on('message', onMessage);

            ee.on('client-message-in',  async (message) => {
                webChatApi.postWebchatGuestConversationMemberMessages(chatInfo.id, chatInfo.member.id, {
                    body: message.message
                }).then((d)=>{
                    console.log(`delivered: ${JSON.stringify(d)}`);
                    service.messageDelivered(message);
                    deliver = d.sender.id;
                }).catch(console.error);
            });
            
            
        });
        socket.connect(chatInfo.eventStreamUri);

    }).catch(console.error);;
}

ee.on('purecloud-connected', async(e) => {
    service.getClientSentMessages(clientConnected).then(messages => {
        messages.forEach(e => {
            ee.emit('client-message-in', e);
        });
    });
});

module.exports = {
    webChatGuestConversation
}
