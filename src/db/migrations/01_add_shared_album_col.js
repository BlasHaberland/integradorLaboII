const { initConnection } = require('../conection');

async function migrate() {
    try {
        const db = await initConnection();
        console.log('Iniciando migración...');
        await db.query(`
            ALTER TABLE albumes 
            ADD COLUMN IF NOT EXISTS id_usuario_compartido INT DEFAULT NULL
        `);
        console.log('Columna id_usuario_compartido añadida o ya existente.');

        // Intentar añadir la FK (puede fallar si ya existe)
        try {
            await db.query(`
                ALTER TABLE albumes 
                ADD CONSTRAINT fk_usuario_compartido 
                FOREIGN KEY (id_usuario_compartido) REFERENCES usuarios(id_usuario) 
                ON DELETE CASCADE
            `);
            console.log('Restricción FK añadida.');
        } catch (fkError) {
            console.log('La restricción FK puede que ya exista o hubo un error al añadirla:', fkError.message);
        }

        console.log('Migración completada con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
