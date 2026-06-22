const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/perfis'));
  },
  filename: (req, file, cb) => {
    // Nome único: id do usuário + timestamp + extensão original
    const extensao = path.extname(file.originalname);
    const nomeArquivo = `usuario-${req.usuario.id}-${Date.now()}${extensao}`;
    cb(null, nomeArquivo);
  },
});

const filtroArquivo = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png|webp/;
  const extensaoValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  const mimeValido = tiposPermitidos.test(file.mimetype);

  if (extensaoValida && mimeValido) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens JPEG, JPG, PNG ou WEBP são permitidas.'));
  }
};

const upload = multer({
  storage,
  fileFilter: filtroArquivo,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

module.exports = upload;