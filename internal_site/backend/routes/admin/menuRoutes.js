const express = require("express");
const router = express.Router();
const checkRole = require("../../middleware/rolemiddleware");
const menuController = require("../../controllers/menuController");
const authenticateToken = require("../../middleware/authMiddleware");
const upload = require("../../controllers/menuController"); // Lưu ý: Có thể cần kiểm tra lại cách import upload nếu không dùng trong route này

// Route lấy menu (công khai)
router.get("/", menuController.getAllMenuItems);

// Route thêm món (có upload file)
router.post(
  "/",
  authenticateToken,
  checkRole(["manager"]),
  menuController.createMenuItem
);

// Route cập nhật món
router.patch(
  "/:id",
  authenticateToken,
  checkRole(["manager"]),
  menuController.updateMenuItem
);

// Route xóa món
router.delete(
  "/:id",
  authenticateToken,
  checkRole(["manager"]),
  menuController.deleteMenuItem
);

// Route khôi phục món
router.post(
  "/restore/:id",
  authenticateToken,
  checkRole(["manager"]),
  menuController.restoreMenuItem
);

module.exports = router;
