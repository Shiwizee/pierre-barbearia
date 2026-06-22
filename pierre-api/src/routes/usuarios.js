const express = require('express');
const router = express.Router();
const { verificarToken, verificarBarbeiro } = require('../middlewares/authMiddleware');
const upload = require('../config/upload');
const {
  verPerfil,
  editarPerfil,
  listarClientes,
  verCliente,
  suspenderCliente,
  reativarCliente,
  uploadFoto,
} = require('../controllers/usuariosController');

// Rotas do usuário logado
router.get('/perfil', verificarToken, verPerfil);
router.put('/perfil', verificarToken, editarPerfil);
router.post('/perfil/foto', verificarToken, upload.single('foto'), uploadFoto);

// Rotas exclusivas do barbeiro
router.get('/clientes', verificarToken, verificarBarbeiro, listarClientes);
router.get('/cliente/:id', verificarToken, verificarBarbeiro, verCliente);
router.post('/suspender/:id', verificarToken, verificarBarbeiro, suspenderCliente);
router.post('/reativar/:id', verificarToken, verificarBarbeiro, reativarCliente);

module.exports = router;