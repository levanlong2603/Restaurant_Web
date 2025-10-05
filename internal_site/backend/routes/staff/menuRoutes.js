
const express = require('express');
const { getMenu, addMenuItem, updateMenuItem, deleteMenuItem } = require('../../controllers/menuController');
const { checkRole } = require('../../middleware/rolemiddleware')
const router = express.Router();

router.get('/', getMenu);
 router.post('/', checkRole(['staff']), addMenuItem);
 router.put('/:id', checkRole(['staff']), updateMenuItem);
 router.delete('/:id',checkRole(['staff']), deleteMenuItem);
 
module.exports = router;