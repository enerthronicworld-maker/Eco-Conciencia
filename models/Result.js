const { DataTypes, Model } = require('sequelize');

class Result extends Model {
  static initModel(sequelize) {
    Result.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        tipo: {
          type: DataTypes.STRING(20),
          allowNull: false,
          validate: {
            isIn: [['huella', 'juego']]
          }
        },
        detalle: { type: DataTypes.JSONB, allowNull: true },
        score: { type: DataTypes.FLOAT, allowNull: true },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
      },
      {
        sequelize,
        modelName: 'Result',
        tableName: 'results',
        timestamps: false
      }
    );
  }
}

module.exports = Result;
