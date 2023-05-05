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
      Dish.belongsTo(models.Allcode, {
        foreignKey: "dishType",
        targetKey: "keyMap",
        as: "dishTypeData",
      });
      Dish.belongsTo(models.Restaurant, {
        foreignKey: "restaurantId",
        as: "restaurantData",
      });
      Dish.hasMany(models.DishOrder, {
        foreignKey: "dishId",
        as: "DishOrderData",
      });
      Dish.hasMany(models.Image, {
        foreignKey: "idMap",
        as: "photoData",
      });
    }
  }

  Dish.init(
    {
      nameVi: DataTypes.STRING,
      nameEn: DataTypes.STRING,
      dishType: DataTypes.STRING,
      descriptionVi: DataTypes.TEXT,
      descriptionEn: DataTypes.TEXT,
      priceVi: DataTypes.INTEGER,
      priceEn: DataTypes.FLOAT,
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
