"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Allcode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Allcode.hasMany(models.User, {
        foreignKey: "roleId",
        targetKey: "keyMap",
        as: "userData",
      });
      Allcode.hasMany(models.Restaurant, {
        foreignKey: "provinceId",
        targetKey: "keyMap",
        as: "restaurantData",
      });
      Allcode.hasMany(models.Food, {
        foreignKey: "countryId",
        targetKey: "keyMap",
        as: "foodData",
      });
      Allcode.hasMany(models.Schedule, {
        foreignKey: "timeType",
        targetKey: "keyMap",
        as: "scheduleData",
      });
    }
  }

  Allcode.init(
    {
      keyMap: DataTypes.STRING,
      type: DataTypes.STRING,
      valueVi: DataTypes.STRING,
      valueEn: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Allcode",
    }
  );
  return Allcode;
};
