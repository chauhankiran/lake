"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("priorities", [
      {
        name: "Low",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "Normal",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "High",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "Urgent",
        createdAt: Sequelize.fn("NOW"),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("priorities", null, {});
  },
};
