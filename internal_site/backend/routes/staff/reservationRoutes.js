const express = require('express');
const router = express.Router();
const reservationController = require('../../controllers/reservationController');
const authenticateToken = require('../../middleware/authMiddleware');

// Đặt bàn (khách hàng không cần token, nhân viên cần token)
router.post('/', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next); // Nhân viên
  }
  next(); // Khách hàng
}, reservationController.bookTable);

// Duyệt đơn (chỉ nhân viên)
router.post('/approve/:id', authenticateToken, reservationController.approveReservation);
router.get('/search', authenticateToken, reservationController.getReservationsByPhone);
router.get('/all', authenticateToken, reservationController.getAllReservations);
router.put('/cancel', authenticateToken, reservationController.cancelReservation);
router.put('/update/:id', authenticateToken, reservationController.updateReservation);
router.get('/table/:table_id', authenticateToken, reservationController.getReservationByTableId);
router.put('/checkin/:id', authenticateToken, reservationController.checkin);
router.put('/left/:id', authenticateToken, reservationController.customerLeft);

module.exports = router;