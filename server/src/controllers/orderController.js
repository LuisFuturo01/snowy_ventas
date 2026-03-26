import { pool } from '../config/db.js';

export const createOrder = async (req, res) => {
    const { client_id, items, total, status } = req.body;
    const sellerId = req.user ? req.user.id : null;
    const finalStatus = status || 'pendiente';
    const finalProcessedBy = finalStatus === 'completado' ? sellerId : null;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'El carrito esta vacio' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Validar stock antes de procesar
        if (finalStatus === 'completado') {
            for (const item of items) {
                const [stockRows] = await connection.query('SELECT stock, name FROM products WHERE id = ?', [item.id]);
                if (stockRows.length === 0) {
                    await connection.rollback();
                    return res.status(400).json({ message: `Producto ID ${item.id} no encontrado` });
                }
                const available = stockRows[0].stock || 0;
                const quantity = parseFloat(item.quantity) || 0;
                if (quantity > available) {
                    await connection.rollback();
                    return res.status(400).json({
                        message: `Stock insuficiente para "${stockRows[0].name}". Disponible: ${available}, Solicitado: ${quantity}`
                    });
                }
            }
        }

        const [orderResult] = await connection.query(
            'INSERT INTO orders (client_id, total_amount, status, processed_by) VALUES (?, ?, ?, ?)',
            [client_id, total, finalStatus, finalProcessedBy]
        );
        const orderId = orderResult.insertId;

        for (const item of items) {
            const [prodRows] = await connection.query('SELECT buy_price FROM products WHERE id = ?', [item.id]);
            const currentCost = prodRows[0] && prodRows[0].buy_price ? parseFloat(prodRows[0].buy_price) : 0;
            const price = parseFloat(item.price) || 0;
            const quantity = parseFloat(item.quantity) || 0;

            if (finalStatus === 'completado') {
                await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, item.id]);
            }

            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_moment, cost_at_moment) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.id, quantity, price, currentCost]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Orden registrada', orderId });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

export const getOrders = async (req, res) => {
    try {
        const query = `
            SELECT o.id, o.total_amount, o.status, o.created_at, u.name as client_name 
            FROM orders o
            JOIN users u ON o.client_id = u.id
            ORDER BY o.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const [orderRows] = await pool.query(`
            SELECT o.*, u.name as client_name, u.email, u.phone 
            FROM orders o
            JOIN users u ON o.client_id = u.id
            WHERE o.id = ?
        `, [id]);

        if (orderRows.length === 0) return res.status(404).json({ message: 'Pedido no encontrado' });

        const [itemsRows] = await pool.query(`
            SELECT oi.*, p.name as product_name, p.unit 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [id]);

        res.json({
            ...orderRows[0],
            items: itemsRows
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const employeeId = req.user ? req.user.id : null;

    try {
        // Verificar que la orden existe y su estado actual
        const [orderCheck] = await pool.query('SELECT status FROM orders WHERE id = ?', [id]);
        if (orderCheck.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        const currentStatus = orderCheck[0].status;

        // No permitir cambios si ya esta completado o cancelado
        if (currentStatus === 'completado') {
            return res.status(400).json({ message: 'El pedido ya fue completado, no se puede modificar' });
        }
        if (currentStatus === 'cancelado') {
            return res.status(400).json({ message: 'El pedido ya fue cancelado' });
        }

        if (status === 'completado') {
            // Validar stock de los items antes de completar
            const [orderItems] = await pool.query(`
                SELECT oi.product_id, oi.quantity, p.stock, p.name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [id]);

            for (const item of orderItems) {
                if (item.quantity > (item.stock || 0)) {
                    return res.status(400).json({
                        message: `Stock insuficiente para "${item.name}". Disponible: ${item.stock || 0}, Requerido: ${item.quantity}`
                    });
                }
            }

            // Descontar stock
            for (const item of orderItems) {
                await pool.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
            }

            await pool.query('UPDATE orders SET status = ?, processed_by = ? WHERE id = ?', [status, employeeId, id]);
        } else if (status === 'cancelado') {
            await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        } else {
            await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        }

        res.json({ message: `Pedido #${id} actualizado a: ${status}` });
    } catch (error) {
        console.error('Error updateOrderStatus:', error);
        res.status(500).json({ message: error.message });
    }
};
