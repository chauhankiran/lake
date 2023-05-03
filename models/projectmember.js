"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProjectMember extends Model {
    static associate(models) {}
  }
  ProjectMember.init(
    {
      projectId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ProjectMember",
    }
  );

  return ProjectMember;
};
