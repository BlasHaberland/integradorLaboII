const { comentarioSocket } = require('./comentario.socket');

const socketServer = (io) => {
    io.on('connection', (socket) => {
        console.log('Un usuario se conectó:', socket.id);

        // Aquí solo registras los listeners una vez por conexión
        comentarioSocket(socket, io);

        socket.on('disconnect', () => {
            console.log('Usuario desconectado:', socket.id);
        });
    });
};

module.exports = { socketServer };