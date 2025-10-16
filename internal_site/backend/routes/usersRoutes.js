const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/rolemiddleware');

router.get('/', authenticateToken, checkRole(['manager']), usersController.getAllUsers);
router.get('/deleted', authenticateToken, checkRole(['manager']), usersController.getDeletedUsers); // Route mới để lấy người dùng đã xóa mềm
router.get('/:id', authenticateToken, usersController.getUser);
router.post('/', authenticateToken, checkRole(['manager']), usersController.createUser);
router.put('/:user_id', authenticateToken, usersController.updateUser);
router.delete('/:id', authenticateToken, checkRole(['manager']), usersController.deleteUser);
router.post('/restore/:user_id', authenticateToken, checkRole(['manager']), usersController.restoreUser); // Route mới để khôi phục người dùng
router.put('/change-password', authenticateToken, usersController.changePassword);
router.put('/approve/:user_id',authenticateToken, checkRole(['manager']),  usersController.approveUser);
router.put('/reject/:id',authenticateToken, checkRole(['manager']),  usersController.rejectUser);
router.put('/reject/:user_id',authenticateToken, checkRole(['manager']),  usersController.rejectUser);

module.exports = router;