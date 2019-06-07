# Messaging NodeJs and [PureCloud](https://www.genesys.com/platform/purecloud)

## Introduction

POC of messaging online/offline with [NodeJs] and [PureColud]

## About the code

Web socket API that consume services of PureCloud

* [**N**ode.js](https://nodejs.org): runtime environment
* [**M**ongoose.js](http://www.mongoosejs.com) ([MongoDB](https://www.mongodb.com)): database
* [**S**ocket.io.js](https://socket.io): enables real-time, bidirectional and event-based communication.

### Web client

There is a web application to test the WebSocket API.

### Initial setup

cd into the local repo directory and run:
```console
npm install
```

### Running the application
```console
node server/server
```

<img src="https://raw.githubusercontent.com/ktufernando/messaging/master/diagrams/Deploy%20diagram%20-%20Node1.jpg" />
