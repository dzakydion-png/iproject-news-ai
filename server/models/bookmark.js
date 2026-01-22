'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Bookmark extends Model {
    static associate(models) {
      // Setiap Bookmark "Milik" satu User
      Bookmark.belongsTo(models.User, { foreignKey: 'UserId' });
    }
  }
  
  Bookmark.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: "Title is required" } }
    },
    url: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    summary: DataTypes.TEXT, 
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { notEmpty: { msg: "UserId is required" } }
    }
  }, {
    sequelize,
    modelName: 'Bookmark',
  });
  return Bookmark;
};