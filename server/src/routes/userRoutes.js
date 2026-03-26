import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, getClients, createClientUser } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/clients-list', getClients);
router.post('/create-client', createClientUser);
router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);

export default router;