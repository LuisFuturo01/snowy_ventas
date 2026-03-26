import { pool } from '../config/db.js';

// Registrar COMPRA de mercadería (Entrada de Stock / Salida de Dinero)
export const purchaseProduct = async (req, res) => {
    const { product_id, quantity, total_cost, description } = req.body;
    const userId = req.user.id; // <-- AQUÍ OBTENEMOS QUIÉN LO HIZO (Del Token)

    if (!product_id || !quantity || !total_cost) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Aumentar Stock del Producto
        await connection.query(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [quantity, product_id]
        );

        // 2. Registrar el Gasto en Contabilidad vinculado al Usuario
        const detail = description || `Compra de ${quantity} unidades (Prod ID: ${product_id})`;
        await connection.query(
            "INSERT INTO expenses (user_id, description, amount, type) VALUES (?, ?, ?, 'compra_mercaderia')",
            [userId, detail, total_cost]
        );

        await connection.commit();
        res.json({ message: 'Compra registrada y stock actualizado correctamente' });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};