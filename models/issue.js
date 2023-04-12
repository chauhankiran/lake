"use strict";

const dayjs = require("dayjs");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Issue extends Model {
    static associate(models) {}
  }
  Issue.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      active: DataTypes.BOOLEAN,
      projectId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      createdAt: {
        type: DataTypes.DATE,
        get() {
          return dayjs(this.getDataValue("createdAt")).format("DD MMM YYYY");
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        get() {
          return dayjs(this.getDataValue("updatedAt")).format("DD MMM YYYY");
        },
      },
    },
    {
      sequelize,
      modelName: "Issue",
    }
  );
  return Issue;
};
