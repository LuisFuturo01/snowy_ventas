import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};

async function setup() {
    console.log('⏳ Iniciando configuración de DB...');
    const connection = await createConnection(dbConfig);

    // 1. Crear Base de Datos
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);

    // 2. Crear Tablas
    await connection.query(`
        CREATE TABLE IF NOT EXISTS roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(20) NOT NULL UNIQUE
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role_id INT,
            FOREIGN KEY (role_id) REFERENCES roles(id)
        )
    `);

    // 3. Insertar datos iniciales (Ignorar si ya existen)
    await connection.query(`INSERT IGNORE INTO roles (id, name) VALUES (1, 'admin'), (2, 'empleado'), (3, 'cliente')`);
    
    // Admin por defecto (Pass: 123456)
    await connection.query(`INSERT IGNORE INTO users (name, email, password, role_id) VALUES ('Admin Snowy', 'admin@snowy.com', '123456', 1)`);

    console.log('✅ Base de datos snowy_ventas_db configurada con éxito.');
    connection.end();
}

setup().catch(console.error);