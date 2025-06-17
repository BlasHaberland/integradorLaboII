# Trabajo final para LABORATORIO 2 
Este proyecto es una web de artesanos interactiva para que los usuarios puedan subir sus creaciones y compartirlas con otras personas

[Visita la web](https://integradorlaboii.onrender.com/)

## Requisitos 
- Tener instalado Node.js y npm.
- Tener un servidor MySQL en funcionamiento.

## Info de la web
### Funcionalidades
- Registrarse como usuario
- Modificar perfil para mencionar antecedentes e intereses
- Poder crear albumes y clasificarlos por tags
- Poder a cada album subirle imagenes con una descripcion y titulo
- Poder cmentar imagenes propias y de otros usuaris
- Agregar otros usuarios como amigos para ver sus albumes e imagenes

## Instalacion
1. Clonar el repositorio
```bash
git clone https://github.com/BlasHaberland/integradorLaboII.git
```

2. Ingresar a la carpeta del proyecto
   
4. Agregar un archivo .env usando en .env.example como plantilla
   
6. Editar el .env
```
PORT=3000
MYSQL_URI="mysql://usuario:contraseña@localhost:3306/nombre_base_datos"
```
- Reemplaza usuario, contraseña y nombre_base_datos con tus credenciales de MySQL.
  
5. Instala las dependencias
  -Dependencias
    - express
    - ejs
    - mysql2
    - dotenv
    - bcryptjs
    - cookie-parser
    - cors
    - jsonwebtoken
    - multer
    - socket.io
  -Dependencias de desarrollo
    - nodemon
      
 6. Iniciar el sevidor
```
npm run dev
```

## Tecnologias usadas
### Frontend
- ejs
- tailwind
- javascript

### Backend
- Node.js
- Express.js
- MySQL
- dotenv
- mysql2


> [!NOTE]
> Para desplegar la web se utiliza Vercel que es un entorno efimero, es decir que las imagenes que se suban en produccion al reiniciar el servidor ya no se podran ver.
> Habria que usar un servicio de terceros para poder subir imagenes ej: amazon(S3), cloudinary, u otro.
