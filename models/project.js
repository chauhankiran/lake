"use strict";

const dayjs = require("dayjs");
const { Model } = require("sequelize");
const { dateFormat } = require("../constants/globals");

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
          return dayjs(this.getDataValue("createdAt")).format(dateFormat);
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        get() {
          return dayjs(this.getDataValue("updatedAt")).format(dateFormat);
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
