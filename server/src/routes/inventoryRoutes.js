import { Router } from 'express';
import { purchaseProduct } from '../controllers/inventoryController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/purchase', verifyToken, purchaseProduct);

export default router;