"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Booking.belongsTo(models.Allcode, {
        foreignKey: "statusId",
        targetKey: "keyMap",
        as: "statusData",
      });
      Booking.belongsTo(models.Allcode, {
        foreignKey: "timeType",
        targetKey: "keyMap",
        as: "timeTypeData",
      });
      // Booking.belongsTo(models.Restaurant, {
      //   foreignKey: "restaurantId",
      //   as: "restaurantData",
      // });
      Booking.belongsTo(models.User, {
        foreignKey: "customerId",
        as: "customerData",
      });
      Booking.hasMany(models.DishOrder, {
        foreignKey: "bookingId",
        as: "dishOrderData",
      });
    }
  }

  Booking.init(
    {
      statusId: DataTypes.STRING,
      customerId: DataTypes.INTEGER,
      restaurantId: DataTypes.INTEGER,
      table: DataTypes.INTEGER,
      date: DataTypes.STRING,
      timeType: DataTypes.STRING,
      token: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Booking",
    }
  );
  return Booking;
};
