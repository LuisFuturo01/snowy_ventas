import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role_id, phone, created_at FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req, res) => {
    const { name, email, password, role_id } = req.body;
    try {
        if (!name || !email || !password || !role_id) {
            return res.status(400).json({ message: 'Faltan datos' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await pool.query(
            'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role_id]
        );
        res.json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'El correo ya existe' });
        res.status(500).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role_id, phone, currentPassword, newPassword } = req.body;

    try {
        // Si se quiere cambiar contrasena, verificar la actual
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Debes ingresar la contrasena actual para cambiarla' });
            }
            const [userRows] = await pool.query('SELECT password FROM users WHERE id = ?', [id]);
            if (userRows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

            const isMatch = await bcrypt.compare(currentPassword, userRows[0].password);
            if (!isMatch) {
                return res.status(401).json({ message: 'La contrasena actual es incorrecta' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await pool.query('UPDATE users SET name = ?, email = ?, role_id = ?, phone = ?, password = ? WHERE id = ?',
                [name, email, role_id, phone || '', hashedPassword, id]);
        } else {
            await pool.query('UPDATE users SET name = ?, email = ?, role_id = ?, phone = ? WHERE id = ?',
                [name, email, role_id, phone || '', id]);
        }

        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'El correo ya existe' });
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
        }
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getClients = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email FROM users WHERE role_id = 3 ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createClientUser = async (req, res) => {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nombre, Email y Contrasena son obligatorios' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password, role_id, phone) VALUES (?, ?, ?, 3, ?)',
            [name, email, hashedPassword, phone || '']
        );
        res.json({ message: 'Cliente registrado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ese correo ya esta registrado' });
        }
        res.status(500).json({ message: error.message });
    }
};
