const db = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// VER PERFIL DO USUÁRIO LOGADO
const verPerfil = async (req, res) => {
  const id = req.usuario.id;

  try {
    const [usuarios] = await db.query(
      'SELECT id, nome, apelido, email, telefone, foto, tipo FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.status(200).json(usuarios[0]);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// EDITAR PERFIL
const editarPerfil = async (req, res) => {
  const id = req.usuario.id;
  const { nome, apelido, telefone, senha } = req.body;

  try {
    // Verifica se o apelido já está em uso por outro usuário
    if (apelido) {
      const [apelidoExiste] = await db.query(
        'SELECT id FROM usuarios WHERE apelido = ? AND id != ?',
        [apelido, id]
      );

      if (apelidoExiste.length > 0) {
        return res.status(400).json({ erro: 'Apelido já em uso.' });
      }
    }

    // Se enviou nova senha, criptografa
    let senhaCriptografada = null;
    if (senha) {
      senhaCriptografada = await bcrypt.hash(senha, 10);
    }

    await db.query(
      `UPDATE usuarios SET 
        nome = COALESCE(?, nome),
        apelido = COALESCE(?, apelido),
        telefone = COALESCE(?, telefone),
        senha = COALESCE(?, senha)
       WHERE id = ?`,
      [nome, apelido, telefone, senhaCriptografada, id]
    );

    return res.status(200).json({ mensagem: 'Perfil atualizado com sucesso!' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// LISTAR CLIENTES (barbeiro)
const listarClientes = async (req, res) => {
  const { busca } = req.query;

  try {
    let query = `
      SELECT u.id, u.nome, u.apelido, u.email, u.telefone,
        CASE 
          WHEN s.id IS NOT NULL AND s.ativa = TRUE AND (s.fim IS NULL OR s.fim > NOW()) 
          THEN TRUE 
          ELSE FALSE 
        END AS suspenso,
        s.fim AS suspensao_fim
      FROM usuarios u
      LEFT JOIN suspensoes s ON s.cliente_id = u.id AND s.ativa = TRUE
      WHERE u.tipo = 'cliente'
    `;

    const params = [];

    if (busca) {
      query += ' AND (u.apelido LIKE ? OR u.id = ?)';
      params.push(`%${busca}%`, busca);
    }

    query += ' ORDER BY u.nome ASC';

    const [clientes] = await db.query(query, params);

    return res.status(200).json(clientes);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// SUSPENDER CLIENTE (barbeiro)
const suspenderCliente = async (req, res) => {
  const { id } = req.params;
  const { motivo, dias } = req.body;
  const barbeiroId = req.usuario.id;

  try {
    // Desativa suspensões anteriores
    await db.query(
      'UPDATE suspensoes SET ativa = FALSE WHERE cliente_id = ?',
      [id]
    );

    // Calcula a data de fim
    let fim = null;
    if (dias) {
      fim = new Date();
      fim.setDate(fim.getDate() + dias);
    }

    // Cria nova suspensão
    await db.query(
      'INSERT INTO suspensoes (cliente_id, barbeiro_id, motivo, fim) VALUES (?, ?, ?, ?)',
      [id, barbeiroId, motivo, fim]
    );

    return res.status(200).json({ mensagem: 'Cliente suspenso com sucesso!' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// REATIVAR CLIENTE (barbeiro)
const reativarCliente = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      'UPDATE suspensoes SET ativa = FALSE WHERE cliente_id = ?',
      [id]
    );

    return res.status(200).json({ mensagem: 'Cliente reativado com sucesso!' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// VER CLIENTE ESPECÍFICO (barbeiro)
const verCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const [clientes] = await db.query(
      `SELECT u.id, u.nome, u.apelido, u.email, u.telefone, u.foto,
        CASE
          WHEN s.id IS NOT NULL AND s.ativa = TRUE AND (s.fim IS NULL OR s.fim > NOW()) 
          THEN TRUE 
          ELSE FALSE 
        END AS suspenso,
        s.fim AS suspensao_fim
      FROM usuarios u
      LEFT JOIN suspensoes s ON s.cliente_id = u.id AND s.ativa = TRUE
      WHERE u.id = ? AND u.tipo = 'cliente'`,
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    return res.status(200).json(clientes[0]);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// UPLOAD DE FOTO DE PERFIL
const uploadFoto = async (req, res) => {
  const id = req.usuario.id;

  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhuma imagem foi enviada.' });
  }

  try {
    // Busca a foto antiga para deletar depois (se existir)
    const [usuarios] = await db.query(
      'SELECT foto FROM usuarios WHERE id = ?',
      [id]
    );

    const fotoAntiga = usuarios[0]?.foto;

    // Salva o novo caminho no banco
    const caminhoFoto = `/uploads/perfis/${req.file.filename}`;

    await db.query(
      'UPDATE usuarios SET foto = ? WHERE id = ?',
      [caminhoFoto, id]
    );

    // Remove a foto antiga do servidor, se existir
    if (fotoAntiga) {
      const caminhoAntigo = path.join(__dirname, '../..', fotoAntiga);
      fs.unlink(caminhoAntigo, (erro) => {
        if (erro) console.log('Aviso: não foi possível remover a foto antiga.');
      });
    }

    return res.status(200).json({
      mensagem: 'Foto de perfil atualizada com sucesso!',
      foto: caminhoFoto,
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

module.exports = {
  verPerfil,
  editarPerfil,
  listarClientes,
  verCliente,
  suspenderCliente,
  reativarCliente,
  uploadFoto,
};