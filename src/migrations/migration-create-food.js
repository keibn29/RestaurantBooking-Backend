"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Foods", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      priceVi: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      priceEn: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      avatar: {
        type: Sequelize.STRING,
      },
      countryId: {
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
    await queryInterface.dropTable("Foods");
  },
};
