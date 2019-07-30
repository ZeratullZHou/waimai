const server = require('http').createServer();

const io = require('socket.io')(server, {
    path: '/test',
    serveClient: false,
    // below are engine.IO options
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

let router = '/home';

io.on('connection', (socket) => {
    socket.emit('main', 'socket connected');

    socket.emit('sub', 'socket connected');

    socket.on('mainClient', (data) => {
        console.log(data);
    });
});

server.listen(5000);