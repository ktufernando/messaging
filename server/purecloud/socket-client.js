const platformClient = require('purecloud-guest-chat-client');
const WebSocketClient = require('websocket').client;
const { ee } = require('../service/service');

const client = platformClient.ApiClient.instance;
let chatInfo;
let socket = new WebSocketClient();

// Create API instance
const webChatApi = new platformClient.WebChatApi();

const onMessage = (message) =>{
    
    console.log('Purecloud - Socket - onMessage');
    console.log(message);

    // Chat message
    if (message && message.utf8Data) {

        const metadata = JSON.parse(message.utf8Data).metadata;

        if(metadata && metadata.type){
            switch (metadata.type) {
                case 'message':
                    {
                        // Handle message from member
                        console.log('Handle message from agent');

                        ee.emit('agent-message-in', message.metadata);

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
                        console.log('Unknown message type: ' + message.metadata.type);
                    }
            }
        }
    }
}

const webChatGuestConversation = async(user) => {

    console.log('Purecloud - Socket - webChatGuestConversation');
    console.log('Intentando conexion con PureCloud');

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
                name: user.name
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
            console.log('Connect with PureCloud Error: ' + error.toString());
        });
        socket.on('connect', (connection) =>  {
            console.log(`Socket client with PureCloud Connected ${connection}`);
            ee.emit('agent-connected');
            connection.on('message', onMessage );
        });
        socket.connect(chatInfo.eventStreamUri);
    }).catch(console.error);;
}

ee.on('client-message-in',  async (message) => {
    webChatApi.postWebchatGuestConversationMemberMessages(chatInfo.id, chatInfo.member.id, {
        body: message
    }).catch(console.error);
});


module.exports = {
    webChatGuestConversation
}
