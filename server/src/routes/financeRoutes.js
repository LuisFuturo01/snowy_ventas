import { Router } from 'express';
import { getSummary, addExpense, getAuditReport } from '../controllers/financeController.js';

const router = Router();

router.get('/summary', getSummary);
router.post('/expenses', addExpense);
router.get('/audit', getAuditReport);

export default router;