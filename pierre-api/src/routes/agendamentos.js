const express = require('express');
const router = express.Router();
const { verificarToken, verificarBarbeiro } = require('../middlewares/authMiddleware');
const {
  listarDoCliente,
  listarDoBarbeiro,
  listarProximos,
  historicoCliente,
  historicoBarbeiro,
  notificacoesPendentes,
  marcarNotificado,
  criar,
  criarPeloBarbeiro,
  cancelarPeloCliente,
  cancelarPeloBarbeiro,
  marcarConcluido,
  marcarNaoCompareceu,
} = require('../controllers/agendamentosController');

// Rotas do cliente
router.get('/meus', verificarToken, listarDoCliente);
router.get('/historico', verificarToken, historicoCliente);
router.get('/notificacoes', verificarToken, notificacoesPendentes);
router.patch('/notificacoes/:id', verificarToken, marcarNotificado);
router.post('/', verificarToken, criar);
router.patch('/cancelar/:id', verificarToken, cancelarPeloCliente);

// Rotas do barbeiro
router.get('/barbeiro/proximos', verificarToken, verificarBarbeiro, listarProximos);
router.get('/barbeiro/historico', verificarToken, verificarBarbeiro, historicoBarbeiro);
router.get('/barbeiro', verificarToken, verificarBarbeiro, listarDoBarbeiro);
router.post('/barbeiro', verificarToken, verificarBarbeiro, criarPeloBarbeiro);
router.patch('/barbeiro/cancelar/:id', verificarToken, verificarBarbeiro, cancelarPeloBarbeiro);
router.patch('/barbeiro/concluir/:id', verificarToken, verificarBarbeiro, marcarConcluido);
router.patch('/barbeiro/nao-compareceu/:id', verificarToken, verificarBarbeiro, marcarNaoCompareceu);

module.exports = router;