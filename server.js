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
const sequelize = require('./config/db');
const { User, Result } = require('./models');

// conectar DB
sequelize.authenticate().then(() => console.log('MySQL connected')).catch(err => console.error(err));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/calculadora', require('./routes/calculadora'));
app.use('/api/games', require('./routes/games'));

// servir frontend estático
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
