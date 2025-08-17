const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Result } = require('../models');

function auth(req, res, next){
  const header = req.headers.authorization;
  if(!header) return res.status(401).json({ error: 'No autorizado' });
  const token = header.split(' ')[1];
  try{ req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch(e){ return res.status(401).json({ error: 'Token inválido' }); }
}

// Guardar puntaje
router.post('/score', auth, async (req, res) => {
  try{
    const { score, detalle } = req.body; // detalle opcional
    await Result.create({ user_id: req.user.id, tipo: 'juego', score, detalle });
    res.json({ ok: true });
  }catch(e){ console.error(e); res.status(500).json({ error: 'Error' }); }
});

// Obtener puntajes del usuario
router.get('/scores', auth, async (req, res) => {
  try{
    const scores = await Result.findAll({ where: { user_id: req.user.id, tipo: 'juego' }, order: [['created_at','DESC']] });
    res.json(scores);
  }catch(e){ console.error(e); res.status(500).json({ error: 'Error' }); }
});

module.exports = router;
