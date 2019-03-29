require('./config/config');

const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const mongoose = require('mongoose');

const path = require('path');

const app = express();
let server = http.createServer(app);

const publicPath = path.resolve(__dirname, '../public');
const port = process.env.PORT || 80;

app.use(express.static(publicPath));

// IO = esta es la comunicacion del backend
module.exports.io = socketIO(server);
require('./socket/socket');


mongoose.connect(process.env.URLDB, (err, res) => {

    if (err) throw err;

    console.log('Base de datos ONLINE');

});


server.listen(port, (err) => {

    if (err) throw new Error(err);

    console.log(`Server ONLINE - Port: ${ port }`);

});

require('./socket-client');