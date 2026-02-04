const { initConnection } = require('../conection');

async function migrate() {
    try {
        const db = await initConnection();
        console.log('Iniciando migración 02...');
        await db.query(`
            ALTER TABLE imagenes 
            ADD COLUMN IF NOT EXISTS compartida TINYINT(1) DEFAULT 0
        `);
        console.log('Columna compartida añadida o ya existente en la tabla imagenes.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migración 02:', error);
        process.exit(1);
    }
}

migrate();
