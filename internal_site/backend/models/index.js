const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/db');

// Khởi tạo các model
const models = {};

console.log('Initializing models...');
try {
  models.User = require('./User')(sequelize);
  models.Customer = require('./Customer')(sequelize);
  models.Menu = require('./Menu')(sequelize);
  models.Table = require('./Table')(sequelize);
  models.Reservation = require('./Reservation')(sequelize);
  models.ReservationDetail = require('./ReservationDetail')(sequelize);
  models.OrderItem = require('./OrderItem')(sequelize);
  models.Bill = require('./Bill')(sequelize);
  models.Sequelize = Sequelize;
  console.log('Models initialized:', Object.keys(models));
} catch (error) {
  console.error('Error initializing models:', error);
}

// Định nghĩa mối quan hệ
console.log('Defining associations...');
try {
  // ReservationDetail thuộc về Reservation
  models.ReservationDetail.belongsTo(models.Reservation, {
    foreignKey: 'reservation_id',
    as: 'reservation',
  });
  models.Reservation.hasMany(models.ReservationDetail, {
    foreignKey: 'reservation_id',
    as: 'details',
  });

  // Customer có nhiều Reservation
  models.Customer.hasMany(models.Reservation, {
    foreignKey: 'customer_id',
    as: 'reservations',
  });
  models.Reservation.belongsTo(models.Customer, {
    foreignKey: 'customer_id',
    as: 'customer',
  });

  // Reservation có nhiều OrderItem
  models.Reservation.hasMany(models.OrderItem, {
    foreignKey: 'reservation_id',
    as: 'orderItems',
  });
  models.OrderItem.belongsTo(models.Reservation, {
    foreignKey: 'reservation_id',
    as: 'reservation',
  });

  // Reservation có nhiều Bill
  models.Reservation.hasOne(models.Bill, {
    foreignKey: 'reservation_id',
    as: 'bill',
  });
  models.Bill.belongsTo(models.Reservation, {
    foreignKey: 'reservation_id',
    as: 'reservation',
  });

  // Reservation thuộc về User (staff_id)
  models.Reservation.belongsTo(models.User, {
    foreignKey: 'staff_id',
    as: 'staff',
  });

  models.OrderItem.belongsTo(models.Menu, {
    foreignKey: 'menu_id',
    as: 'menu',
  });
  models.Menu.hasMany(models.OrderItem, {
    foreignKey: 'menu_id',
    as: 'orderItems',
  });

  console.log('Associations defined successfully');
} catch (error) {
  console.error('Error defining associations:', error);
}

// Debug: Kiểm tra mối quan hệ
if (models.Reservation) {
  console.log('Reservation associations after definition:', models.Reservation.associations);
} else {
  console.error('Reservation model is undefined');
}

// Xuất sequelize và các model
module.exports = {
  sequelize,
  Sequelize,
  User: models.User,
  Customer: models.Customer,
  Menu: models.Menu,
  Table: models.Table,
  Reservation: models.Reservation,
  ReservationDetail: models.ReservationDetail,
  OrderItem: models.OrderItem,
  Bill: models.Bill,
};