const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/authMiddleware');
const tableController = require('../../controllers/tableController');


router.get('/', authenticateToken, tableController.getTableStatus);
router.get('/served', authenticateToken, tableController.getSeveredTables);

module.exports = router;