"use strict";

const dayjs = require("dayjs");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.User, {
        as: "user",
      });
    }
  }
  Comment.init(
    {
      content: DataTypes.TEXT,
      userId: DataTypes.INTEGER,
      active: DataTypes.BOOLEAN,
      issueId: DataTypes.INTEGER,
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
      modelName: "Comment",
    }
  );
  return Comment;
};
