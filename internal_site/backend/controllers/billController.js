// const { sequelize } = require('../config/db');
// const Sequelize = require('sequelize');
// const ReservationDetail = require('../models/ReservationDetail')(sequelize);
// const Bill = require('../models/Bill')(sequelize);
// const Reservation = require('../models/Reservation')(sequelize);
// const User = require('../models/User')(sequelize);
// const OrderItem = require('../models/OrderItem')(sequelize);
// const Menu = require('../models/Menu')(sequelize);
const {
  Bill,
  Customer,
  Reservation,
  ReservationDetail,
  OrderItem,
  Menu,
} = require("../models");

exports.checkout = async (req, res) => {
  const { reservation_id, paymethod, reservation_status, total_amount } = req.body;


  try {
    const time = new Date();

    const staff = req.user;
    if (!staff) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (staff.role !== "staff") {
      return res
        .status(403)
        .json({ message: "Chỉ nhân viên mới có thể thanh toán" });
    }

    if (!reservation_id || !paymethod || !reservation_status) {
      return res.status(400).json({ message: "Thiếu thông tin đặt bàn" });
    }

    if (!total_amount || total_amount === 0) {
      return res.status(400).json({ message: "Chưa gọi món" });
    }

    const reservation = await Reservation.findOne({
      where: { id: reservation_id },
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin đặt bàn này" });
    }

    console.log(reservation.status);

    if (reservation.status !== "serving") {
      return res.status(400).json({ message: "Trạng thái bàn không hợp lệ" });
    }

    console.log(paymethod);

    const bill = await Bill.create({
      reservation_id: reservation.id,
      staff_id: staff.id,
      payment_method: paymethod,
      total_amount: total_amount,
      time: time,
    });

    // Cập nhật status và checkout_time nếu reservation_status là "completed"
    const updates = { status: reservation_status };
    if (reservation_status === "completed") {
      updates.checkout_time = new Date(); // Cập nhật checkout_time nếu khách rời đi ngay
    }
    await Reservation.update(updates, { where: { id: reservation.id } });

    return res.status(200).json({ message: "Checkout successful", bill });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBillDetail = async (req, res) => {
  const { id: reservationId } = req.params;

  try {
    if (req.user.role !== "staff") {
      return res
        .status(403)
        .json({ message: "Chỉ nhân viên mới có thể xem hóa đơn" });
    }
    const reservation = await Reservation.findOne({
      where: { id: reservationId },
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["name", "phoneNumber"],
        },
        {
          model: ReservationDetail,
          as: "details",
          attributes: ["table_id"],
        },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Menu,
              as: "menu",
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin đặt bàn này" });
    }
    return res.status(200).json({ reservation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllBills = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res
        .status(403)
        .json({ message: "Chỉ nhân viên mới có thể xem hóa đơn" });
    }

    const bills = await Bill.findAll({
      include: [
        {
          model: Reservation,
          as: "reservation",
          include: [
            {
              model: Customer,
              as: "customer",
              attributes: ["name", "phoneNumber"],
            },
            {
              model: ReservationDetail,
              as: "details",
              attributes: ["table_id"],
            },
          ],
        },
      ],
      order: [["time", "DESC"]],
      attributes: ["id", "time", "payment_method", "total_amount"],
      where: {
        staff_id: req.user.id,
      },
    });

    return res.status(200).json(bills);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
