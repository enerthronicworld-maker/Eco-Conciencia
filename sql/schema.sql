-- Crear la base de datos (ejecutar una sola vez como superusuario)
-- ⚠️ OJO: Render ya crea la BD automáticamente, así que este paso es solo para local
CREATE DATABASE eco_conciencia
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TEMPLATE = template0;

-- Conectarse a la base (solo en psql local)
\c eco_conciencia;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de resultados
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('huella', 'juego')),
  detalle JSONB,
  score REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
