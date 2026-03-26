import { pool } from '../config/db.js';

export const getProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE is_active = 1 ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//crear un producto
export const createProduct = async (req, res) => {
    const { name, price, unit, category } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, price, unit) VALUES (?, ?, ?)',
            [name, price, unit]
        );
        res.json({ 
            id: result.insertId, 
            name, price, unit 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un producto
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, unit } = req.body;
    try {
        await pool.query(
            'UPDATE products SET name = ?, price = ?, unit = ? WHERE id = ?',
            [name, price, unit, id]
        );
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Borrar un producto
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
        res.json({ message: 'Producto eliminado logicamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};