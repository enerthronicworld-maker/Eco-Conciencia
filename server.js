// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB y modelos
const { sequelize } = require('./models'); // usa models/index.js
const { User, Result } = require('./models');

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/calculadora', require('./routes/calculadora'));
app.use('/api/games', require('./routes/games'));

// servir frontend estático
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// Iniciar servidor después de conectar a DB
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');

    // sincronizar modelos (solo en desarrollo, en producción usar migraciones)
    // await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar a DB:', error);
  }
})();
