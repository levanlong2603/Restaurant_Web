const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Customer = sequelize.define(
    "Customer",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      phoneNumber: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: "customer",
      timestamps: true,
      // Ánh xạ tên cột updatedAt nếu nó không phải là updated_at
      updatedAt: "updatedAt", // Chỉ định rõ tên cột trong cơ sở dữ liệu
      createdAt: "createdAt",
    }
  );

  return Customer;
};
