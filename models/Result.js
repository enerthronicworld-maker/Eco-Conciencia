const { DataTypes, Model } = require('sequelize');

class Result extends Model {
  static initModel(sequelize){
    Result.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      tipo: { type: DataTypes.ENUM('huella','juego'), allowNull: false },
      detalle: { type: DataTypes.JSON, allowNull: true },
      score: { type: DataTypes.FLOAT, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, { sequelize, modelName: 'results', tableName: 'results', timestamps: false });
  }
}

module.exports = Result;
