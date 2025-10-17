const express = require('express');
const menuController = require('../controllers/menuController');
const { createReservation } = require('../controllers/reservationController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

// Public: list menus
router.get('/menu', menuController.getAllMenuItems);

// Protected admin/staff actions (frontend uses these routes)
router.post('/menu', authenticateToken, menuController.createMenuItem);
router.patch('/menu/:menu_id', authenticateToken, menuController.updateMenuItem);
router.delete('/menu/:menu_id', authenticateToken, menuController.deleteMenuItem);
router.post('/menu/restore/:menu_id', authenticateToken, menuController.restoreMenuItem);

router.post('/reservations', createReservation);

module.exports = router;