const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Result } = require('../models');

// middleware de autenticación simple
function auth(req, res, next){
  const header = req.headers.authorization;
  if(!header) return res.status(401).json({ error: 'No autorizado' });
  const token = header.split(' ')[1];
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Ejemplo de cálculo de huella: recibe datos y calcula kgCO2/anual estimado
router.post('/', auth, async (req, res) => {
  try{
    const data = req.body; // { transporte: {tipo, kmSemana}, energiaKwhMes, alimentacion: 'alta'|'media'|'baja' }

    // valores de referencia (muy simplificados)
    let total = 0;
    // transporte
    if(data.transporte){
      const { tipo, kmSemana } = data.transporte;
      const kmAnual = (kmSemana || 0) * 52;
      const factor = tipo === 'auto' ? 0.21 : tipo === 'bus' ? 0.05 : tipo === 'moto' ? 0.1 : 0.0; // kgCO2/km
      total += kmAnual * factor;
    }
    // energia
    if(data.energiaKwhMes){
      const kwhAnual = data.energiaKwhMes * 12;
      const factorEnergia = 0.5; // kgCO2/kWh (ejemplo)
      total += kwhAnual * factorEnergia;
    }
    // alimentacion
    if(data.alimentacion){
      total += data.alimentacion === 'alta' ? 2000 : data.alimentacion === 'media' ? 1200 : 800;
    }

    // guardar en tabla results
    const detalle = { input: data, kgCO2_anual: total };
    await Result.create({ user_id: req.user.id, tipo: 'huella', detalle });

    res.json({ kgCO2_anual: total, recomendaciones: recomendaciones(total) });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

function recomendaciones(total){
  if(total > 5000) return ['Reduce viajes en auto','Cambia a energia renovable','Aumenta consumo vegetal'];
  if(total > 2000) return ['Usa transporte público','Mejora eficiencia energética en casa'];
  return ['Buen trabajo — mantiene hábitos sostenibles'];
}

module.exports = router;
