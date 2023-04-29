"use strict";

const dayjs = require("dayjs");
const { Model } = require("sequelize");
const { dateFormat } = require("../constants/globals");

module.exports = (sequelize, DataTypes) => {
  class Issue extends Model {
    static associate(models) {
      Issue.belongsTo(models.Type, {
        foreignKey: "typeId",
        as: "type",
      });
      Issue.belongsTo(models.Priority, {
        foreignKey: "priorityId",
        as: "priority",
      });
      Issue.belongsTo(models.User, {
        foreignKey: "assigneeId",
        as: "assignee",
      });
      Issue.belongsTo(models.Status, {
        foreignKey: "statusId",
        as: "status",
      });
    }
  }
  Issue.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      active: DataTypes.BOOLEAN,
      projectId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      priorityId: DataTypes.INTEGER,
      typeId: DataTypes.INTEGER,
      assigneeId: DataTypes.INTEGER,
      statusId: DataTypes.INTEGER,
      dueDate: DataTypes.DATE,
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
      modelName: "Issue",
    }
  );
  return Issue;
};
