"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("statuses", [
      {
        name: "Assigned",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "In progress",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "Review",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "Done",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "Close",
        createdAt: Sequelize.fn("NOW"),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("statuses", null, {});
  },
};
