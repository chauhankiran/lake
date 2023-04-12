"use strict";

const dayjs = require("dayjs");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      Project.belongsTo(models.User, {
        as: "user",
      });
    }
  }
  Project.init(
    {
      name: DataTypes.STRING,
      key: DataTypes.STRING,
      description: DataTypes.TEXT,
      active: DataTypes.BOOLEAN,
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
      modelName: "Project",
    }
  );
  return Project;
};
