const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/dashboardController");
const authenticateToken = require("../../middleware/authMiddleware");
const checkrole = require("../../middleware/rolemiddleware");

router.get(
  "/overview",
  authenticateToken,
  checkrole(["manager"]),
  dashboardController.getOverviewStats
);
router.get(
  "/revenue",
  authenticateToken,
  checkrole(["manager"]),
  dashboardController.getRevenueStats
);
router.get(
  "/dishes",
  dashboardController.getDishesStats
);
router.get(
  "/customers",
  authenticateToken,
  checkrole(["manager"]),
  dashboardController.getCustomersStats
);
router.get(
  "/reservations",
  authenticateToken,
  checkrole(["manager"]),
  dashboardController.getReservationsStats
);
router.get(
  "/category-dishes",
  authenticateToken,
  checkrole(["manager"]),
  dashboardController.getCategoryDishesStats
);
router.get(
  "/customer-details/:customerId",
  authenticateToken,
  checkrole(["manager"]),
  dashboardController.getCustomerDetails
);

module.exports = router;
