"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("types", [
      {
        name: "Bug",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "Enhancement",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "Documentation",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "UI",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "Question",
        createdAt: Sequelize.fn("NOW"),
      },
      {
        name: "Performance",
        createdAt: Sequelize.fn("NOW"),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("types", null, {});
  },
};
