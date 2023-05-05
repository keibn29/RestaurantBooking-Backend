"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Restaurant.belongsTo(models.Allcode, {
        foreignKey: "provinceId",
        targetKey: "keyMap",
        as: "provinceData",
      });
      Restaurant.belongsTo(models.User, {
        foreignKey: "managerId",
        as: "managerData",
      });
      Restaurant.hasMany(models.Dish, {
        foreignKey: "restaurantId",
        as: "dishData",
      });
      Restaurant.hasMany(models.Schedule, {
        foreignKey: "restaurantId",
        as: "scheduleData",
      });
      Restaurant.hasMany(models.Booking, {
        foreignKey: "restaurantId",
        as: "bookingData",
      });
      Restaurant.hasMany(models.Image, {
        foreignKey: "idMap",
        as: "photoData",
      });
      Restaurant.hasMany(models.Review, {
        foreignKey: "restaurantId",
        as: "reviewData",
      });
    }
  }

  Restaurant.init(
    {
      managerId: DataTypes.INTEGER,
      provinceId: DataTypes.STRING,
      nameVi: DataTypes.STRING,
      nameEn: DataTypes.STRING,
      descriptionVi: DataTypes.TEXT,
      descriptionEn: DataTypes.TEXT,
      addressVi: DataTypes.STRING,
      addressEn: DataTypes.STRING,
      avatar: DataTypes.STRING,
      table: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Restaurant",
    }
  );
  return Restaurant;
};
