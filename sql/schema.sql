-- Cambia `eco_conciencia` por el nombre que desees o ejecútalo tal cual
CREATE DATABASE IF NOT EXISTS eco_conciencia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eco_conciencia;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tipo ENUM('huella','juego') NOT NULL,
  detalle JSON NULL,
  score FLOAT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
