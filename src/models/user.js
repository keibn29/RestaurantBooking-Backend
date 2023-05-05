"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Allcode, {
        foreignKey: "roleId",
        targetKey: "keyMap",
        as: "roleData",
      });
      User.hasOne(models.Restaurant, {
        foreignKey: "managerId",
        as: "restaurantData",
      });
      User.hasMany(models.Booking, {
        foreignKey: "customerId",
        as: "bookingData",
      });
      User.hasMany(models.Review, {
        foreignKey: "customerId",
        as: "reviewData",
      });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      avatar: DataTypes.STRING,
      roleId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
