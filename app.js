require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const socketio = require('socket.io');
const registroRoutes = require('./src/routes/registro.routes');

const { initConnection } = require('./src/db/conection');
//const { initSocketIO } = require('./src/socket/socket-server');
const upload = require('./src/config/multer.config');
const autMiddleware = require('./src/middleware/aut.middleware');


const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

//MOTOR DE PLANTILLA
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

//RUTAS
//pagina de inicio
app.get('/', (req, res) => {
  res.render('index', { title: 'Inicio' });
});
app.use('/registro', registroRoutes);






server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initConnection()
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database error:', err));
});

