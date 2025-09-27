const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Bill = sequelize.define('Bill', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        reservation_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            references: { model: 'reservation', key: 'id' } 
        },
        staff_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            references: { model: 'user', key: 'id' } 
        },
        payment_method: { 
            type: DataTypes.ENUM('cash', 'credit_card', 'bank_transfer'), 
            allowNull: false, 
            defaultValue: 'cash'
        },
        total_amount: { type: DataTypes.FLOAT, allowNull: false },
        time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'bill' 
    });

    return Bill;
};