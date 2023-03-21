"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Dish extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Dish.belongsTo(models.Allcode, {
        foreignKey: "countryId",
        targetKey: "keyMap",
        as: "countryData",
      });
      Dish.belongsTo(models.Restaurant, {
        foreignKey: "restaurantId",
        as: "restaurantData",
      });
      Dish.hasMany(models.DishOrder, {
        foreignKey: "dishId",
        as: "DishOrderData",
      });
    }
  }

  Dish.init(
    {
      nameVi: DataTypes.STRING,
      nameEn: DataTypes.STRING,
      descriptionVi: DataTypes.TEXT,
      descriptionEn: DataTypes.TEXT,
      priceVi: DataTypes.STRING,
      priceEn: DataTypes.STRING,
      restaurantId: DataTypes.INTEGER,
      avatar: DataTypes.STRING,
      countryId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Dish",
    }
  );
  return Dish;
};
