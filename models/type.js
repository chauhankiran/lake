"use strict";

const dayjs = require("dayjs");
const { Model } = require("sequelize");
const { dateFormat } = require("../constants/globals");

module.exports = (sequelize, DataTypes) => {
  class Type extends Model {
    static associate(models) {
      Type.hasMany(models.Issue, {
        foreignKey: "typeId",
      });
    }
  }
  Type.init(
    {
      name: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      projectId: DataTypes.INTEGER,
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
      modelName: "Type",
    }
  );
  return Type;
};
