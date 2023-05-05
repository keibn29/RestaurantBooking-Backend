"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.belongsTo(models.User, {
        foreignKey: "customerId",
        as: "customerData",
      });
      Review.belongsTo(models.Restaurant, {
        foreignKey: "restaurantId",
        as: "restaurantData",
      });
    }
  }

  Review.init(
    {
      customerId: DataTypes.INTEGER,
      restaurantId: DataTypes.INTEGER,
      star: DataTypes.INTEGER,
      detail: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Review",
    }
  );
  return Review;
};
