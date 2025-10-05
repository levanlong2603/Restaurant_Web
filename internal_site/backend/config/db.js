const { Sequelize, Op } = require('sequelize');
require('dotenv').config();

const sequelizeTemp = new Sequelize({
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    timezone: '+07:00',
    logging: false
});

const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,  
    dialect: process.env.DB_DIALECT,
    timezone: '+07:00',
    logging: process.env.DB_LOGGING === 'true',
});

// Import tất cả model
const Customer = require('../models/Customer')(sequelize);
const Reservation = require('../models/Reservation')(sequelize);
const Menu = require('../models/Menu')(sequelize);
const OrderItem = require('../models/OrderItem')(sequelize);
const Bill = require('../models/Bill')(sequelize);
const ReservationDetail = require('../models/ReservationDetail')(sequelize);
const Table = require('../models/Table')(sequelize);
const User = require('../models/User')(sequelize);

const connectDB = async () => {
    try {
        await sequelizeTemp.query('CREATE DATABASE IF NOT EXISTS restaurant_db;');
        console.log('Database restaurant_db đã được tạo hoặc đã tồn tại.');
        await sequelizeTemp.close();
        await sequelize.authenticate();
        console.log('Kết nối Sequelize thành công!');

        // Định nghĩa quan hệ
        console.log("Defining associations...");

        Customer.hasMany(Reservation, { foreignKey: 'customer_id', as: 'reservations' });
        Reservation.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

        Reservation.belongsTo(User, { foreignKey: 'staff_id', as: 'staff' });
        User.hasMany(Reservation, { foreignKey: 'staff_id', as: 'reservations' });

        Reservation.hasMany(OrderItem, { foreignKey: 'reservation_id', as: 'orderItems' });
        OrderItem.belongsTo(Reservation, { foreignKey: 'reservation_id', as: 'reservation' });

        Menu.hasMany(OrderItem, { foreignKey: 'menu_id', as: 'orderItems' });
        OrderItem.belongsTo(Menu, { foreignKey: 'menu_id', as: 'menu' });

        Reservation.hasOne(Bill, { foreignKey: 'reservation_id', as: 'bill' });
        Bill.belongsTo(Reservation, { foreignKey: 'reservation_id', as: 'reservation' });

        User.hasMany(Bill, { foreignKey: 'staff_id', as: 'bills' });
        Bill.belongsTo(User, { foreignKey: 'staff_id', as: 'staff' });

        ReservationDetail.belongsTo(Reservation, { foreignKey: 'reservation_id', as: 'reservation' });
        Reservation.hasMany(ReservationDetail, { foreignKey: 'reservation_id', as: 'reservationDetails' });

        Table.hasMany(ReservationDetail, { foreignKey: 'table_id', as: 'reservationDetails' });
        ReservationDetail.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

        console.log("Associations defined successfully");

        console.log("Reservation associations after definition:", {
            details: Reservation.associations.reservationDetails ? "reservationDetails" : "undefined",
            customer: Reservation.associations.customer ? "customer" : "undefined",
            orderItems: Reservation.associations.orderItems ? "orderItems" : "undefined",
            bill: Reservation.associations.bill ? "bill" : "undefined",
            staff: Reservation.associations.staff ? "staff" : "undefined",
        });

        console.log("OrderItem associations after definition:", {
            reservation: OrderItem.associations.reservation ? "reservation" : "undefined",
            menu: OrderItem.associations.menu ? "menu" : "undefined",
        });

        await sequelize.sync();  
        console.log('Đồng bộ mô hình thành công!');
    } catch (err) {
        console.error('Lỗi kết nối Sequelize:', err);
        process.exit(1);
    }
};

module.exports = { 
    sequelize, 
    connectDB, 
    Op,
    Customer,
    Reservation,
    Menu,
    OrderItem,
    Bill,
    ReservationDetail,
    Table,
    User
};