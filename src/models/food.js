"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Food extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  Food.init(
    {
      nameVi: DataTypes.STRING,
      nameEn: DataTypes.STRING,
      descriptionVi: DataTypes.TEXT,
      descriptionEn: DataTypes.TEXT,
      price: DataTypes.STRING,
      restaurantId: DataTypes.INTEGER,
      avatar: DataTypes.STRING,
      countryId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Food",
    }
  );
  return Food;
};
