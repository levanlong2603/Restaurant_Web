const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ReservationDetail = sequelize.define('ReservationDetail', {
        reservation_detail_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        table_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            references: { model: 'table', key: 'table_id' } 
        },
        reservation_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            references: { model: 'reservation', key: 'reservation_id' } 
        }
    }, {
        tableName: 'reservation_detail' 
    });

    return ReservationDetail;
};