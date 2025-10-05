const express = require('express');
const router = express.Router();
const orderItemController= require('../../controllers/orderItemController'); // Điều chỉnh đường dẫn nếu cần
const authenticateToken = require('../../middleware/authMiddleware');

router.post('/', authenticateToken, orderItemController.addOrderItem);         
router.put('/update/:id', authenticateToken, orderItemController.updateOrderItem);    
router.delete('/:id', authenticateToken, orderItemController.deleteOrderItem); 
router.get('/:id', authenticateToken, orderItemController.getOrderItems); 

module.exports = router;