"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // define association here
    }
  }
  Project.init(
    {
      name: DataTypes.STRING,
      key: DataTypes.STRING,
      description: DataTypes.TEXT,
      active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Project",
    }
  );
  return Project;
};
