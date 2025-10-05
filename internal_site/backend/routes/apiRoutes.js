const express = require('express');
const { getMenu, addMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { createReservation } = require('../controllers/reservationController');
const router = express.Router();

router.get('/menu', getMenu);
router.post('/reservations', createReservation);

module.exports = router;