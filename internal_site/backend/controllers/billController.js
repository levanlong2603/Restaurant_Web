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

    // Find reservation and its order items so we can compute total if needed
    const reservation = await Reservation.findOne({
      where: { reservation_id: reservation_id },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Menu,
              as: 'menu',
              attributes: ['price']
            }
          ]
        }
      ]
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin đặt bàn này" });
    }

    console.log('Reservation status:', reservation.status);

    if (reservation.status !== "serving") {
      return res.status(400).json({ message: "Trạng thái bàn không hợp lệ" });
    }

    // Compute total_amount from orderItems if caller didn't provide a valid total
    let computedTotal = 0;
    if (reservation.orderItems && Array.isArray(reservation.orderItems)) {
      computedTotal = reservation.orderItems.reduce((sum, item) => {
        if (item.status === 'cancelled') return sum;
        const price = parseFloat(item.menu?.price || 0) || 0;
        const qty = Number(item.quantity || 0) || 0;
        return sum + price * qty;
      }, 0);
    }

    const finalTotal = (total_amount && Number(total_amount) > 0) ? Number(total_amount) : computedTotal;

    if (!finalTotal || finalTotal === 0) {
      return res.status(400).json({ message: "Chưa gọi món or total amount is zero" });
    }

    console.log('Using finalTotal for bill:', finalTotal, 'paymethod:', paymethod);

    const bill = await Bill.create({
      reservation_id: reservation.reservation_id,
      staff_id: staff.user_id,
      payment_method: paymethod,
      total_amount: finalTotal,
      time: time,
    });

    // Cập nhật status và checkout_time nếu reservation_status là "completed"
    const updates = { status: reservation_status };
    if (reservation_status === "completed") {
      updates.checkout_time = new Date(); // Cập nhật checkout_time nếu khách rời đi ngay
    }
  await Reservation.update(updates, { where: { reservation_id: reservation.reservation_id } });

    return res.status(200).json({ message: "Checkout successful", bill });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBillDetail = async (req, res) => {
  // support both :reservation_id and legacy :id param names
  const reservationId = req.params.reservation_id || req.params.id;

  try {
    if (req.user.role !== "staff") {
      return res
        .status(403)
        .json({ message: "Chỉ nhân viên mới có thể xem hóa đơn" });
    }

    const reservation = await Reservation.findOne({
      where: { reservation_id: reservationId },
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
              attributes: ["menu_id", "name", "price"],
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

    // Find the bill associated with this reservation (if any)
    const bill = await Bill.findOne({ where: { reservation_id: reservationId } });

    // Construct a response shape that the frontend expects:
    const response = {
      reservation,
      total_amount: bill ? bill.total_amount : 0,
      status: reservation.status,
      payment_method: bill ? bill.payment_method : null,
      bill: bill || null,
    };

    return res.status(200).json(response);
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
      attributes: ["bill_id", "time", "payment_method", "total_amount"],
      where: {
        staff_id: req.user.user_id,
      },
    });

    return res.status(200).json(bills);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
