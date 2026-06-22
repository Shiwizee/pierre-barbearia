const express = require('express');
const router = express.Router();
const { verificarToken, verificarBarbeiro } = require('../middlewares/authMiddleware');
const { listar, criar, editar, desativar } = require('../controllers/servicosController');

// Rota pública (cliente e barbeiro podem ver)
router.get('/', verificarToken, listar);

// Rotas exclusivas do barbeiro
router.post('/', verificarToken, verificarBarbeiro, criar);
router.put('/:id', verificarToken, verificarBarbeiro, editar);
router.patch('/desativar/:id', verificarToken, verificarBarbeiro, desativar);

module.exports = router;