"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Allcodes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      keyMap: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      valueVi: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      valueEn: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Allcodes");
  },
};
