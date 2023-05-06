"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "priorities",
      "projectId",
      Sequelize.INTEGER
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("priorities", "projectId");
  },
};
