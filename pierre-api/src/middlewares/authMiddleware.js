const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // formato: "Bearer token"

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, tipo }
    next(); // continua para o controller
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};

const verificarBarbeiro = (req, res, next) => {
  if (req.usuario.tipo !== 'barbeiro') {
    return res.status(403).json({ erro: 'Acesso restrito ao barbeiro.' });
  }
  next();
};

module.exports = { verificarToken, verificarBarbeiro };