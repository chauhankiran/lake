"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("issues", "priorityId", Sequelize.INTEGER);
    await queryInterface.addColumn("issues", "typeId", Sequelize.INTEGER);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("issues", "priorityId");
    await queryInterface.removeColumn("issues", "typeId");
  },
};
