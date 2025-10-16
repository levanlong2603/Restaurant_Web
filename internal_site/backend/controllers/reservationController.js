const { Sequelize, User, Customer, Reservation, ReservationDetail, Table } = require('../models');


exports.bookTable = async (req, res) => {
  try {
    const { name, phoneNumber, reservation_time, num_people, tables, status } = req.body;
    let staff_id = null;
    if (req.user){
      staff_id = req.user?.user_id || req.user.id;
    }
    console.log(reservation_time);
    if (!name || !phoneNumber || !reservation_time || !num_people) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
    }

    let customer = await Customer.findOne({ where: { phoneNumber } });

    if (!customer) {
      customer = await Customer.create({ name, phoneNumber });
    }

    if (!staff_id) {
      const reservation = await Reservation.create({
        customer_id: customer.customer_id, 
        reservation_time,
        num_people,
        staff_id: null,
        status: "pending"
      });

      return {
        status: 200,
        reservation_id: reservation.reservation_id,
        message: 'Đặt bàn thành công!',
      };
    }
    else{
      if(!tables || tables.length == 0){
        return res.status(400).json({ message: "Vui lòng chọn bàn!" });
      }

      if (!status) {
        return res.status(400).json({ message: "Vui lòng chọn trạng thái!" });
      }

      const employee = await User.findByPk(staff_id);
      if (!employee) {
        return res.status(400).json({ message: "Nhân viên không tồn tại!" });
      }

      let checkin_time = null;
      console.log(status);
      if (status === "serving"){
        checkin_time = new Date();
        console.log(checkin_time);
      }
      console.log(checkin_time);

      const reservation = await Reservation.create({
        customer_id: customer.customer_id, 
        reservation_time,
        checkin_time,
        num_people,
        staff_id: staff_id,
        status: status
      });

      const existingTables = await Table.findAll({
        where: { table_id: tables }, 
        attributes: ['table_id']
      });

      const validTableIds = existingTables.map(t => t.table_id);

      const invalidTableIds = tables.filter(id => !validTableIds.includes(id));

      if (invalidTableIds.length > 0) {
        return res.status(400).json({
          message: "Một số bàn không tồn tại!",
          invalid_tables: invalidTableIds
        });
      }

      const reservationDetails = validTableIds.map(tableId => ({
        reservation_id: reservation.reservation_id,
        table_id: tableId
      }));

      await ReservationDetail.bulkCreate(reservationDetails);

      return res.status(201).json({ 
        message: "Đặt bàn thành công!", 
        reservation_id: reservation.reservation_id, 
        customer_id: customer.customer_id
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


exports.approveReservation = async (req, res) => {
  const reservation_id = req.params.reservation_id || req.params.id;
  const staff_id = req.user?.user_id || req.user?.id;
  const { tables } = req.body; 
  try {
  const reservation = await Reservation.findByPk(reservation_id);
    if (!reservation) {
      return res.status(404).json({ message: "Đơn đặt bàn không tồn tại" });
    }

    if (reservation.status !== "pending") {
      return res.status(400).json({ message: "Đơn đặt bàn đã được xử lý" });
    }

    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return res.status(400).json({ message: "Vui lòng chọn bàn để duyệt!" });
    }

    reservation.staff_id = staff_id;
    reservation.status = "preparing";
    await reservation.save();

    const reservationDetails = tables.map(tableId => ({
      reservation_id: reservation_id,
      table_id: tableId
    }));
    await ReservationDetail.bulkCreate(reservationDetails);

    res.status(200).json({
      message: "Duyệt đơn thành công!",
      reservation: {
        reservation_id: reservation.reservation_id,
        status: reservation.status,
        staff_id: reservation.staff_id,
        reservation_time: reservation.reservation_time,
        num_people: reservation.num_people,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


exports.getReservationsByPhone = async (req, res) => {
    try {
        const { phoneNumber } = req.query;

        if (!phoneNumber) {
            return res.status(400).json({ message: "Vui lòng nhập số điện thoại!" });
        }

        const customer = await Customer.findOne({
            where: { phoneNumber: phoneNumber }
        });

        if (!customer) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng với số điện thoại này!" });
        }

        const reservations = await Reservation.findAll({
      where: {
        customer_id: customer.customer_id,
      },
            include: [
              {
                model: Customer,
                as: 'customer',
                attributes: ['name', 'phoneNumber'],
              },
              {
                model: ReservationDetail,
                as: 'details',
                attributes: ['table_id']
              },
            ],
            order: [['reservation_time', 'DESC']]
        });

        if (reservations.length === 0) {
            return res.status(200).json({
                message: "Không có đặt hàng đang hoạt động cho số điện thoại này.",
                reservations: [],
                count: 0
            });
        }


      res.status(200).json({reservations});
    } catch (error) {
        console.error('Error fetching active reservations:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};  


exports.cancelReservation = async (req, res) => {
  try {
      const { reservation_id } = req.body;

      if (!reservation_id) {
          return res.status(400).json({ message: "Vui lòng cung cấp ID đặt bàn!" });
      }

      const reservation = await Reservation.findByPk(reservation_id);
      if (!reservation) {
          return res.status(404).json({ message: "Không tìm thấy đặt bàn với ID này!" });
      }

      if (reservation.status === 'completed') {
          return res.status(400).json({ message: "Không thể hủy đặt bàn đã hoàn thành!" });
      }

      if (reservation.status === 'serving') {
          return res.status(400).json({ message: "Không thể hủy vì đang được phục vụ!" });
      }

      if (reservation.status === 'cancelled') {
          return res.status(400).json({ message: "Đặt bàn đã bị hủy trước đó!" });
      }

      const reservationDetails = await ReservationDetail.findAll({
          where: { reservation_id: reservation_id }
      });

    const tableIds = reservationDetails.map(rd => rd.table_id);
    const tables = await Table.findAll({
      where: { table_id: { [Sequelize.Op.in]: tableIds } }
    });
      
      const customer = await Customer.findByPk(reservation.customer_id);

    const formattedReservation = {
      reservation_id: reservation.reservation_id,
      start_time: reservation.start_time,
      status: reservation.status,
      customer: customer ? {
        customer_id: customer.customer_id,
        name: customer.name,
        phone_number: customer.phone_number
      } : null,
      tables: reservationDetails.map(detail => {
        const table = tables.find(t => t.table_id === detail.table_id);
        return { table_id: table.table_id, name: table.name };
      })
    };

      await reservation.update({ status: 'cancelled' });

      res.status(200).json({
          message: "Đã hủy đặt bàn!",
          reservation: formattedReservation
      });
  } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateReservation = async (req, res) => {
  try {
      const { reservation_id } = req.params; 

      if (req.user){
        staff_id = req.user?.user_id || req.user.id;
      }
      else{
        return res.status(401).json({ error: "Vui Lòng đăng nhập" });
      }

      const { status, reservation_time, num_people, tables } = req.body; 

  const reservation = await Reservation.findByPk(reservation_id);
      if (!reservation) {
          return res.status(404).json({ error: "Không tìm thấy" });
      }

      await ReservationDetail.destroy({ where: { reservation_id } });

      if(!reservation.staff_id){
        await reservation.update({staff_id})
      }

      await reservation.update({ status, reservation_time, num_people, updatedAt: new Date() });

      if (tables && tables.length > 0) {
          const newDetails = tables.map(table => ({
              reservation_id,
              table_id: table 
          }));
          await ReservationDetail.bulkCreate(newDetails);
      }
      else{
        return res.status(400).json({ message: "Vui lòng chọn bàn!" });
      }

    return res.status(200).json({ message: "Reservation updated successfully", reservation });
  } catch (error) {
      console.error("Error updating reservation:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};


exports.getReservationByTableId = async (req, res) => {
  try {
    const { table_id } = req.params;

    if (!table_id) {
      return res.status(400).json({ message: "Vui lòng nhập ID bàn!" });
    }

    const reservationDetails = await ReservationDetail.findAll({
      where: { table_id: table_id }
    });
    

    if (reservationDetails.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đặt bàn cho bàn này!" });
    }

    
    const reservation_ids = reservationDetails.map(rd => rd.reservation_id);

    const reservations = await Reservation.findOne({
      where: {
        id: {
          [Sequelize.Op.in]: reservation_ids
        },
        status: {
          [Sequelize.Op.or]: ['serving', 'paid']
        }
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['name', 'phoneNumber'],
        },
        { 
          model: ReservationDetail,
          as: 'details',
          attributes: ['table_id']
        }
      ],
    });

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error fetching reservation by table ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


exports.checkin = async (req, res) => {
  try {
    const { reservation_id } = req.params;

    const reservation = await Reservation.findByPk(reservation_id);


    if (!reservation) {
      return res.status(404).json({ message: "Đơn đặt bàn không tồn tại" });
    }

    if (reservation.status !== "preparing") {
      return res.status(400).json({ message: "Trạng thái đạt bàn không hợp lệ" });
    }

    reservation.status = "serving";
    reservation.checkin_time = new Date();
    await reservation.save();

    res.status(200).json({
      message: "Đã xác nhận đơn đặt bàn!",
      reservation: {
        reservation_id: reservation.reservation_id,
        status: reservation.status,
        staff_id: reservation.staff_id,
        reservation_time: reservation.reservation_time,
        checkin_time: reservation.checkin_time,
        num_people: reservation.num_people,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
}

exports.getAllReservations = async (req, res) => {
  try {
    // Debug: Kiểm tra mối quan hệ
    console.log('Reservation associations:', Reservation.associations);

    const reservations = await Reservation.findAll({
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['name', 'phoneNumber'],
        },
        { 
          model: ReservationDetail,
          as: 'details',
          attributes: ['table_id']
        } 
      ],
      order: [['reservation_time', 'DESC']]
    });

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error in getAllReservations:', error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đặt bàn", error: error.message });
  }
};


exports.customerLeft = async (req, res) => {
  try {
    const { reservation_id } = req.params;
    let { checkout_time } = req.body; // Nhận checkout_time từ request

    const reservation = await Reservation.findByPk(reservation_id);

    if (!reservation) {
      return res.status(404).json({ message: "Đơn đặt bàn không tồn tại" });
    }

    // if (reservation.status !== "paid") {
    //   return res.status(400).json({ message: "Trạng thái đặt bàn không hợp lệ" });
    // }

    if (!checkout_time) {
      checkout_time = new Date();
    }
    

    // Cập nhật status và checkout_time
    reservation.status = "completed";
    reservation.checkout_time = new Date(checkout_time); // Lưu checkout_time
    await reservation.save();

    res.status(200).json({
      message: "Khách đã rời khỏi bàn!",
      reservation: {
        reservation_id: reservation.reservation_id,
        status: reservation.status,
        staff_id: reservation.staff_id,
        reservation_time: reservation.reservation_time,
        checkin_time: reservation.checkin_time,
        checkout_time: reservation.checkout_time, // Trả về checkout_time
        num_people: reservation.num_people,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};