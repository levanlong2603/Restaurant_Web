const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ReservationDetail = sequelize.define('ReservationDetail', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        table_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            references: { model: 'table', key: 'id' } 
        },
        reservation_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            references: { model: 'reservation', key: 'id' } 
        }
    }, {
        tableName: 'reservation_detail' 
    });

    return ReservationDetail;
};