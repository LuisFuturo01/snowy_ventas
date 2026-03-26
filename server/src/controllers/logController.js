import { pool } from '../config/db.js';

export const getAccessLogs = async (req, res) => {
    try {
        const [logs] = await pool.query(`
            SELECT 
                al.id,
                al.user_id,
                u.name as user_name,
                u.email as user_email,
                al.ip_address,
                al.browser,
                al.event_type,
                al.created_at
            FROM access_logs al
            JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 500
        `);

        res.json(logs);
    } catch (error) {
        console.error('Error al obtener logs de acceso:', error);
        res.status(500).json({ message: 'Error al obtener los logs de acceso' });
    }
};
