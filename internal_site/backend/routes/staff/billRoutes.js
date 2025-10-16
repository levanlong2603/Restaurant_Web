const express = require('express');
const billController = require('../../controllers/billController');
const authenticateToken = require('../../middleware/authMiddleware');
const e = require('express');
const router = express.Router();

router.post('/', authenticateToken, billController.checkout);
router.get('/:reservation_id', authenticateToken, billController.getBillDetail);
router.get('/all/day', authenticateToken, billController.getAllBills);

module.exports = router;