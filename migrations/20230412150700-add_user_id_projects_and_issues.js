"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("projects", "userId", Sequelize.INTEGER);
    await queryInterface.addColumn("issues", "userId", Sequelize.INTEGER);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("projects", "userId");
    await queryInterface.removeColumn("issues", "userId");
  },
};
