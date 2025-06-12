const { comentarioSocket } = require('./comentario.socket');
const usuariosConectados = {} // <-- aca guardo los usuarios conectados


const socketServer = (io) => {
    io.on('connection', (socket) => {
        console.log('Un usuario se conectó:', socket.id);

        socket.on('usuarioConectado', (id_usuario) => {
            usuariosConectados[id_usuario] = socket.id;
        });

        // Aquí solo registras los listeners una vez por conexión
        comentarioSocket(socket, io);

        socket.on('disconnect', () => {
            console.log('Usuario desconectado:', socket.id);

            for (const [id, sid] of Object.entries(usuariosConectados)) {
                if (sid === socket.id) delete usuariosConectados[id];
            }

        });
    });
};

module.exports = { socketServer, usuariosConectados };