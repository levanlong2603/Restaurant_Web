const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/paymentController');
const authMiddleware = require('../../middleware/authMiddleware');

// VNPAY payment routes
router.post('/create_payment_url', authMiddleware, paymentController.createPaymentUrl);
router.get('/vnpay_return', paymentController.vnpayReturn);
router.get('/vnpay_ipn', paymentController.vnpayIpn);

// Cash payment route
router.post('/payment/cash/:id', authMiddleware, paymentController.cashPayment);

module.exports = router;