const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Result } = require('../models');

// --- Middleware de autenticación ---
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No autorizado' });

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// --- Ruta para calcular huella y guardar resultado ---
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body; 
    // { transporte: {tipo, kmSemana}, energiaKwhMes, alimentacion }

    let total = 0;

    // Transporte
    if (data.transporte) {
      const { tipo, kmSemana } = data.transporte;
      const kmAnual = (kmSemana || 0) * 52;
      const factor =
        tipo === 'auto'
          ? 0.21
          : tipo === 'bus'
          ? 0.05
          : tipo === 'moto'
          ? 0.1
          : 0.0; // kgCO2/km
      total += kmAnual * factor;
    }

    // Energía
    if (data.energiaKwhMes) {
      const kwhAnual = data.energiaKwhMes * 12;
      const factorEnergia = 0.5; // kgCO2/kWh (ejemplo)
      total += kwhAnual * factorEnergia;
    }

    // Alimentación
    if (data.alimentacion) {
      total +=
        data.alimentacion === 'alta'
          ? 2000
          : data.alimentacion === 'media'
          ? 1200
          : 800;
    }

    // Guardar en la tabla results
    const detalle = { input: data, kgCO2_anual: total };
    await Result.create({
      user_id: req.user.id,
      tipo: 'huella',
      detalle,
    });

    res.json({ 
      kgCO2_anual: total, 
      recomendaciones: recomendaciones(total) 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// --- Función de recomendaciones ---
function recomendaciones(total) {
  if (total > 5000)
    return ['Reduce viajes en auto', 'Cambia a energía renovable', 'Aumenta consumo vegetal'];
  if (total > 2000)
    return ['Usa transporte público', 'Mejora eficiencia energética en casa'];
  return ['Buen trabajo — mantén hábitos sostenibles'];
}

module.exports = router;
