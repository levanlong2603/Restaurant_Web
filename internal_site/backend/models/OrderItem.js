const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      order_item_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      reservation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "reservation", key: "reservation_id" },
      },
      menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "menu", key: "menu_id" },
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      note: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM("serving", "cancelled"),
        allowNull: false,
        defaultValue: "serving",
      },
    },
    {
      tableName: "order_item",
      timestamps: true,
      createdAt: "createdAt", 
      updatedAt: "updatedAt", 
    }
  );

  return OrderItem;
};