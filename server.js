// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB y modelos
const { sequelize, User, Result } = require('./models');

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/calculadora', require('./routes/calculadora'));
app.use('/api/games', require('./routes/games'));

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// Iniciar servidor después de conectar a DB
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');

    // ⚡ Crear/actualizar tablas automáticamente
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar a DB:', error);
  }
})();
