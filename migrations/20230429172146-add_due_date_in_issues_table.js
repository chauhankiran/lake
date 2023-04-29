"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("issues", "dueDate", Sequelize.DATEONLY);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("issues", "dueDate");
  },
};
