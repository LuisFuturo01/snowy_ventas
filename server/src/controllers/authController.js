import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contrasena incorrecta' });
        }

        // Generar JWT
        const secret = process.env.JWT_SECRET || 'secreto_super_seguro_snowy';
        const token = jwt.sign(
            { id: user.id, name: user.name, role_id: user.role_id },
            secret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        );

        // Registro de log de acceso (login)
        const ip = req.ip || req.connection.remoteAddress;
        const browser = req.headers['user-agent'] || 'Desconocido';
        await pool.query(
            "INSERT INTO access_logs (user_id, ip_address, browser, event_type) VALUES (?, ?, ?, 'login')",
            [user.id, ip, browser]
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user.id, name: user.name, role_id: user.role_id }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const logout = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado' });
        }
        
        const ip = req.ip || req.connection.remoteAddress;
        const browser = req.headers['user-agent'] || 'Desconocido';
        
        await pool.query(
            "INSERT INTO access_logs (user_id, ip_address, browser, event_type) VALUES (?, ?, ?, 'logout')",
            [req.user.id, ip, browser]
        );
        
        res.json({ message: 'Logout registrado exitosamente' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ message: 'Error al registrar logout' });
    }
};
