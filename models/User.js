const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');

class User extends Model {
  static initModel(sequelize){
    User.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, { sequelize, modelName: 'users', tableName: 'users', timestamps: false });
  }

  // comparar password
  async validPassword(password){
    return await bcrypt.compare(password, this.password);
  }
}

module.exports = User;
