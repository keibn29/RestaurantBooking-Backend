"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Restaurants", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      managerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      provinceId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nameVi: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nameEn: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      descriptionVi: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      descriptionEn: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      addressVi: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      addressEn: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      avatar: {
        type: Sequelize.STRING,
      },
      table: {
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
    await queryInterface.dropTable("Restaurants");
  },
};
