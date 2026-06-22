const express = require('express');
const router = express.Router();
const { verificarToken, verificarBarbeiro } = require('../middlewares/authMiddleware');
const { listarDisponibilidade, salvarBloqueios } = require('../controllers/horariosController');

// Rota pública (cliente precisa ver horários disponíveis)
router.get('/disponibilidade', verificarToken, listarDisponibilidade);

// Rota exclusiva do barbeiro
router.post('/bloquear', verificarToken, verificarBarbeiro, salvarBloqueios);

module.exports = router;