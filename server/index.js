// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './src/config/db.js';

// Importacion de Rutas
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import financeRoutes from './src/routes/financeRoutes.js';
import inventoryRoutes from './src/routes/inventoryRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/ping', async (req, res) => {
    try {
        const [result] = await pool.query('SELECT "Pong! Desde MySQL" as mensaje');
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Snowy] Servidor listo en puerto ${PORT}`);
});
