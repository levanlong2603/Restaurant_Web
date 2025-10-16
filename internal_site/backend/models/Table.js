const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Table = sequelize.define('Table', {
    table_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        capacity: { type: DataTypes.INTEGER, allowNull: false }
    }, {
        tableName: 'table' 
    });

    return Table;
};