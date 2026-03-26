import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function migrate() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL?.trim() === 'true' ? { rejectUnauthorized: false } : undefined
    });

    console.log('Connected! Creating access_logs...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS access_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        ip_address VARCHAR(45),
        browser VARCHAR(255),
        event_type ENUM('login', 'logout') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);
    console.log('access_logs table created.');
    
    try {
      await conn.query('ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT 1;');
      console.log('is_active added to products.');
    } catch(err) {
      if(err.code === 'ER_DUP_FIELDNAME') console.log('is_active already exists.');
      else throw err;
    }
    
    await conn.end();
    console.log('MIGRATION SUCCESS');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
