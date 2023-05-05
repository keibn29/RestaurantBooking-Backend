"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DetailForgot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  DetailForgot.init(
    {
      isUpdated: DataTypes.INTEGER,
      customerId: DataTypes.INTEGER,
      token: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "DetailForgot",
    }
  );
  return DetailForgot;
};
