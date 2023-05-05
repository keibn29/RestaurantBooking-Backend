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
      Allcode.hasMany(models.Dish, {
        foreignKey: "countryId",
        targetKey: "keyMap",
        as: "dishCountryData",
      });
      Allcode.hasMany(models.Dish, {
        foreignKey: "dishType",
        targetKey: "keyMap",
        as: "dishTypeData",
      });
      Allcode.hasMany(models.Schedule, {
        foreignKey: "timeType",
        targetKey: "keyMap",
        as: "scheduleData",
      });
      Allcode.hasMany(models.Booking, {
        foreignKey: "statusId",
        targetKey: "keyMap",
        as: "statusBooking",
      });
      Allcode.hasMany(models.Booking, {
        foreignKey: "timeType",
        targetKey: "keyMap",
        as: "timeTypeBooking",
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
