"use strict";

const dayjs = require("dayjs");
const { Model } = require("sequelize");
const { dateFormat } = require("../constants/globals");

module.exports = (sequelize, DataTypes) => {
  class Priority extends Model {
    static associate(models) {
      Priority.hasMany(models.Issue, {
        foreignKey: "priorityId",
      });
    }
  }
  Priority.init(
    {
      name: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
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
      modelName: "Priority",
    }
  );
  return Priority;
};
