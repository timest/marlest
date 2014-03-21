var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    logger  = io.log,
    redis = require('redis').createClient();

redis.setMaxListeners(0);

var port = process.argv[2] || 4001;
app.listen(port);

io.configure( function() {
    io.set('log level', 0);
});

redis.psubscribe('infos', 'comments');

redis.on('pmessage', function(pattern, channel, message) {
    console.log(pattern, channel, message); 
});

io.sockets.on('connection', function(socket){
    redis.on("pmessage", function(pattern, channel, message) {
        if(pattern=='infos'){
            socket.emit('infos', message);
        }
        if(pattern=='comments'){
            socket.emit('comments', message);
        }
    });

});

redis.on("error", function (err) {
    console.log("Error " + err);
});
