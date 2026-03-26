import { pool } from './src/config/db.js';

async function buildDatabase() {
    console.log('🏗️ Iniciando reconstrucción maestra de la Base de Datos...');
    const connection = await pool.getConnection();

    try {
        // 1. Tabla PRODUCTS (Si no existe)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                buy_price DECIMAL(10, 2) DEFAULT 0,
                price DECIMAL(10, 2) NOT NULL,
                stock INT DEFAULT 0,
                unit VARCHAR(20) NOT NULL,
                category VARCHAR(50) DEFAULT 'General'
            )
        `);
        console.log('✅ Tabla PRODUCTS: Lista.');

        // 2. Tabla ORDERS (La que faltaba)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT NOT NULL,
                processed_by INT DEFAULT NULL,
                status ENUM('pendiente', 'cotizacion', 'preparando', 'completado', 'cancelado') DEFAULT 'pendiente',
                total_amount DECIMAL(10, 2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES users(id),
                FOREIGN KEY (processed_by) REFERENCES users(id)
            )
        `);
        console.log('✅ Tabla ORDERS: Creada/Verificada.');

        // 3. Tabla ORDER_ITEMS (Detalles del pedido)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity DECIMAL(10, 2) NOT NULL,
                price_at_moment DECIMAL(10, 2) NOT NULL,
                cost_at_moment DECIMAL(10, 2) DEFAULT 0,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);
        console.log('✅ Tabla ORDER_ITEMS: Creada/Verificada.');

        // 4. Tabla EXPENSES (Gastos) - Por si acaso
        await connection.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                description VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                type ENUM('compra_mercaderia', 'gasto_operativo') DEFAULT 'gasto_operativo',
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('✅ Tabla EXPENSES: Lista.');

        console.log('🎉 ¡Estructura completa restaurada con éxito!');

    } catch (error) {
        console.error('❌ Error construyendo tablas:', error);
    } finally {
        connection.release();
        process.exit();
    }
}

buildDatabase();