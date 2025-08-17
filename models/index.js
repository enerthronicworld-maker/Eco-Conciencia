const sequelize = require('../config/db');
const User = require('./User');
const Result = require('./Result');

// Inicializar modelos
User.initModel(sequelize);
Result.initModel(sequelize);

// Relaciones
User.hasMany(Result, { foreignKey: 'user_id' });
Result.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Result };
