const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      phoneNumber: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      profilePhoto: { type: DataTypes.STRING, allowNull: true },
      profilePhotoPublicId: { type: DataTypes.STRING, allowNull: true }, //là định danh duy nhất của ảnh trên Cloudinary (ví dụ: users/image123). Khi cần xóa hoặc cập nhật ảnh
      role: {
        type: DataTypes.ENUM("manager", "staff"),
        defaultValue: null,
      },
      lastActive: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
        allowNull: false,
      },
    },
    {
      tableName: "user",
      timestamps: true,
      createdAt: "dateAdded",
      updatedAt: true,
    }
  );

  return User;
};
