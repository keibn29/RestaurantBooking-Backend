"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DishOrder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DishOrder.belongsTo(models.Booking, {
        foreignKey: "bookingId",
        as: "BookingData",
      });
      DishOrder.belongsTo(models.Dish, {
        foreignKey: "dishId",
        as: "dishData",
      });
    }
  }

  DishOrder.init(
    {
      bookingId: DataTypes.INTEGER,
      dishId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "DishOrder",
    }
  );
  return DishOrder;
};
