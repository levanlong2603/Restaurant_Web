const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Reservation = sequelize.define(
    "Reservation",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "customer", key: "id" },
      },
      reservation_time: { type: DataTypes.DATE, allowNull: false },
      checkin_time: { type: DataTypes.DATE, allowNull: true },
      checkout_time: { type: DataTypes.DATE, allowNull: true }, 
      num_people: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
      staff_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "user", key: "id" },
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "preparing",
          "serving",
          "completed",
          "paid",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      dwell_time: { type: DataTypes.INTEGER, allowNull: true }, // Thêm dwell_time
    },
    {
      tableName: "reservation",
      hooks: {
        afterUpdate: (instance, options) => {
          if (
            instance.checkin_time &&
            instance.checkout_time &&
            !instance.dwell_time
          ) {
            const dwellTime = Math.round(
              (new Date(instance.checkout_time) -
                new Date(instance.checkin_time)) /
                60000
            ); // Tính bằng phút
            instance.dwell_time = dwellTime;
            return instance.save({ hooks: false });
          }
        },
      },
    }
  );

  return Reservation;
};
