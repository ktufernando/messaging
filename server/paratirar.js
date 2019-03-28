const WebSocketClient = require('websocket').client;
const socketIO = require('socket.io');
// Obtain a reference to the platformClient object
const platformClient = require('purecloud-guest-chat-client');
const organizationId = '291bf467-8004-4509-9fa5-8ee99e47bdb4';
const deploymentId = 'c5f11f7f-2372-45ce-b54b-1163aa618258';

const client = platformClient.ApiClient.instance;
let chatInfo, socket;

// Create API instance
const webChatApi = new platformClient.WebChatApi();

const createChatBody = {
    organizationId: organizationId,
    deploymentId: deploymentId,
    routingTarget: {
        targetType: 'QUEUE',
        targetAddress: 'QU_BBVA_DIRECT',
    },
    memberInfo: {
        displayName: 'Pepe Argento',
        profileImageUrl: 'https://www.iconsdb.com/icons/preview/gray/guest-xxl.png',
        customFields: {
            firstName: 'Pepe',
            lastName: 'Argento'
        }
    }
};

// Create chat
webChatApi.postWebchatGuestConversations(createChatBody)

    .then((createChatResponse) => {

        // Store chat info
        chatInfo = createChatResponse;

        // Set JWT
        client.setJwt(chatInfo.jwt);

        // Connect to notifications
        socket = new WebSocketClient();

        socket.on('connectFailed', function (error) {
            console.log('Connect Error: ' + error.toString());
        });

        // Connection opened
        socket.on('connect', function (connection) {
            console.log('WebSocket connected');

            // Send a message
            webChatApi.postWebchatGuestConversationMemberMessages(chatInfo.id, chatInfo.member.id, {
                body: 'Message from chat guest'
            }).catch(console.error);


            // Listen for messages
            connection.on('message', function (message) {
                console.log(message);

                // Chat message
                if (message && message.metadata) {

                    switch (message.metadata.type) {
                        case 'message':
                            {
                                // Handle message from member
                                console.log('Handle message from member');
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

            });
        });



        socket.connect(chatInfo.eventStreamUri);





    })
    .catch(console.error);