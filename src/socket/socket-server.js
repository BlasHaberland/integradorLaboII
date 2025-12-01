const { comentarioSocket } = require('./comentario.socket');
const usuariosConectados = {} // <-- aca guardo los usuarios conectados


const socketServer = (io) => {
    io.on('connection', (socket) => {
        console.log('Un usuario se conectó:', socket.id);

        socket.on('usuarioConectado', (id_usuario) => {
            usuariosConectados[id_usuario] = socket.id;
            console.log('Usuario registrado en socket:', id_usuario, socket.id);
        });

        // Aquí solo registras los listeners una vez por conexión
        comentarioSocket(socket, io, usuariosConectados);

        socket.on('disconnect', () => {
            console.log('Usuario desconectado:', socket.id);

            for (const [id, sid] of Object.entries(usuariosConectados)) {
                if (sid === socket.id) delete usuariosConectados[id];
                break;
            }

        });
    });
};

module.exports = { socketServer, usuariosConectados };