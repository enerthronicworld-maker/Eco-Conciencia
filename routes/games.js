// routes/games.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { sequelize, User, Result } = require('../models');
const { QueryTypes } = require('sequelize');

// ------------------- Middleware autenticación -------------------
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No autorizado' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// ------------------- Guardar puntaje -------------------
router.post('/score', auth, async (req, res) => {
  try {
    const { score, detalle = {}, juego } = req.body;
    const detalleObj =
      typeof detalle === 'object' && detalle !== null ? detalle : {};
    if (juego) detalleObj.juego = juego;

    await Result.create({
      user_id: req.user.id,
      tipo: 'juego',
      detalle: detalleObj,
      score: score || 0,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('Error POST /api/games/score:', e);
    res.status(500).json({ error: 'Error al guardar puntaje' });
  }
});

// ------------------- Historial de puntajes de un usuario -------------------
router.get('/scores', auth, async (req, res) => {
  try {
    const scores = await Result.findAll({
      where: { user_id: req.user.id, tipo: 'juego' },
      order: [['created_at', 'DESC']],
    });
    res.json(scores);
  } catch (e) {
    console.error('Error GET /api/games/scores:', e);
    res.status(500).json({ error: 'Error al obtener puntajes' });
  }
});

// ------------------- Ranking global con puntajes parciales -------------------
router.get('/ranking', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const sql = `
      SELECT 
        u.id AS user_id,
        u.name AS name,
        COALESCE(SUM(r.score), 0) AS total,
        COALESCE(SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(r.detalle, '$.juego')) = 'quiz' THEN r.score ELSE 0 END), 0) AS quiz,
        COALESCE(SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(r.detalle, '$.juego')) = 'memoria' THEN r.score ELSE 0 END), 0) AS memoria,
        COALESCE(SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(r.detalle, '$.juego')) = 'sopa' THEN r.score ELSE 0 END), 0) AS sopa,
        COALESCE(SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(r.detalle, '$.juego')) = 'arrastrar' THEN r.score ELSE 0 END), 0) AS arrastrar
      FROM users u
      LEFT JOIN results r 
        ON r.user_id = u.id AND r.tipo = 'juego'
      GROUP BY u.id, u.name
      ORDER BY total DESC
      LIMIT :limit;
    `;

    const rows = await sequelize.query(sql, {
      replacements: { limit },
      type: QueryTypes.SELECT,
    });

    res.json(rows);
  } catch (err) {
    console.error('Error GET /api/games/ranking:', err);
    res.status(500).json({ error: 'Error al obtener ranking' });
  }
});

module.exports = router;
