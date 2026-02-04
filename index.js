require('dotenv').config();
const express = require('express');
const http = require('http');
// const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');



const registroRoutes = require('./src/routes/registro.routes');
const loginRoutes = require('./src/routes/login.routes');
const homeRoutes = require('./src/routes/home.routes');
const albumesRoutes = require('./src/routes/albumes.routes');
const logoutRoutes = require('./src/routes/logout.routes');
const buscarRoutes = require('./src/routes/buscar.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');
const amistadesRoutes = require('./src/routes/amistades.routes');
const notificacionesRoutes = require('./src/routes/notificaciones.routes');
const usuarioMiddleware = require('./src/middleware/usuario.middleware');
const notificacionesMiddleware = require('./src/middleware/notificaciones.middleware');

const { initConnection } = require('./src/db/conection');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(usuarioMiddleware);
app.use(notificacionesMiddleware);

const server = http.createServer(app);

//MOTOR DE PLANTILLA
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

//RUTAS
app.get('/', (req, res) => {
  res.render('index', { title: 'Inicio' });
});

app.use('/registro', registroRoutes);
app.use('/login', loginRoutes);
app.use('/home', homeRoutes);
app.use('/albumes', albumesRoutes);
app.use('/logout', logoutRoutes);
app.use('/buscar', buscarRoutes);
app.use('/usuario', usuariosRoutes);
app.use('/amistades', amistadesRoutes);
app.use('/notificaciones', notificacionesRoutes);

//SocketIO
const { Server } = require('socket.io');
const io = new Server(server);
const { socketServer } = require('./src/socket/socket-server');
socketServer(io);
app.set('io', io);
// CONECCION
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initConnection()
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database error:', err));
});

