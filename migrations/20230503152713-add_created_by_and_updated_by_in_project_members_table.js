"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "projectMembers",
      "createdBy",
      Sequelize.INTEGER
    );
    await queryInterface.addColumn(
      "projectMembers",
      "updatedBy",
      Sequelize.INTEGER
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("projectMembers", "createdBy");
    await queryInterface.removeColumn("projectMembers", "updatedBy");
  },
};
