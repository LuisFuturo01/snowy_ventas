import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // 1. Buscar el token en la cabecera de la petición
    // Normalmente viene como: "Bearer eyJhbGciOi..."
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Tomamos la parte después de "Bearer"

    // 2. Si no hay token, prohibido pasar
    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        // 3. Verificar si el token es válido usando tu clave secreta
        // (Asegúrate que coincida con la que usaste en el Login)
        const secret = process.env.JWT_SECRET || 'secreto_super_seguro_snowy';
        const decoded = jwt.verify(token, secret);

        // 4. Guardar los datos del usuario dentro de 'req' para que el controlador los use
        req.user = decoded; 
        
        // 5. Todo bien, pase al siguiente paso
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

export const isAdmin = (req, res, next) => {
    // Verificar si existe el usuario en la request (inyectado por verifyToken)
    if (!req.user) {
        return res.status(401).json({ message: 'No autenticado' });
    }

    // Role ID 1 asume que es Administrador (con conversión segura por si llega como string)
    if (Number(req.user.role_id) !== 1) {
        return res.status(403).json({ message: 'Acceso denegado. Permisos de administrador requeridos.' });
    }

    next();
};