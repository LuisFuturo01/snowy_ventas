// server/seedData.js
import { pool } from './src/config/db.js';

const products = [
    { name: 'Apio (500g)', price: 9.00, unit: 'unid' },
    { name: 'Cebollín (500g)', price: 14.00, unit: 'unid' },
    { name: 'Zanahoria Cubo (500g)', price: 10.50, unit: 'bolsa' },
    { name: 'Repollo Picado (600g)', price: 9.00, unit: 'bolsa' },
    { name: 'Zanahoria (150g)', price: 8.80, unit: 'kg' },
    { name: 'Espinaca (70g)', price: 11.00, unit: 'atado' },
    { name: 'Palta', price: 27.50, unit: 'kg' },
    { name: 'Tomate Perita', price: 10.90, unit: 'kg' },
    { name: 'Locoto', price: 13.50, unit: 'kg' }
];

async function seed() {
    console.log('🌱 Sembrando datos...');
    try {
        // 1. Insertar Usuarios de prueba
        // Empleado (ID 2)
        await pool.query(`INSERT IGNORE INTO users (id, name, email, password, role_id) VALUES (2, 'Vendedor Luis', 'vendedor@snowy.com', '123456', 2)`);
        // Cliente (ID 3)
        await pool.query(`INSERT IGNORE INTO users (id, name, email, password, role_id) VALUES (3, 'Restaurante Copabol', 'cliente@snowy.com', '123456', 3)`);
        console.log('✅ Usuarios creados: vendedor@snowy.com y cliente@snowy.com (Pass: 123456)');

        // 2. Insertar Productos
        // Limpiamos tabla primero para no duplicar si corres esto varias veces
        await pool.query('TRUNCATE TABLE products'); 
        
        for (const p of products) {
            await pool.query('INSERT INTO products (name, price, unit) VALUES (?, ?, ?)', [p.name, p.price, p.unit]);
        }
        console.log('✅ Productos insertados correctamente.');

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

seed();