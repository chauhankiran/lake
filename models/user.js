"use strict";

const dayjs = require("dayjs");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Project);
    }
  }
  User.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
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
      modelName: "User",
    }
  );
  return User;
};
