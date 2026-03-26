import { Router } from 'express';
import { getAccessLogs } from '../controllers/logController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Ruta protegida solo para administradores
router.get('/access', verifyToken, isAdmin, getAccessLogs);

export default router;
