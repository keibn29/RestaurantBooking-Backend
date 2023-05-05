"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Handbooks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      titleVi: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      titleEn: {
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
      image: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Handbooks");
  },
};
