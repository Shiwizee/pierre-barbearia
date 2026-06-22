const db = require('../config/database');

// LISTAR SERVIÇOS
const listar = async (req, res) => {
  try {
    const [servicos] = await db.query(
      `SELECT id, nome, preco FROM servicos 
       WHERE ativo = TRUE 
       ORDER BY nome ASC`
    );

    return res.status(200).json(servicos);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// CRIAR SERVIÇO
const criar = async (req, res) => {
  const { nome, preco } = req.body;
  const barbeiroId = req.usuario.id;

  try {
    await db.query(
      'INSERT INTO servicos (barbeiro_id, nome, preco) VALUES (?, ?, ?)',
      [barbeiroId, nome, preco]
    );

    return res.status(201).json({ mensagem: 'Serviço criado com sucesso!' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// EDITAR SERVIÇO
const editar = async (req, res) => {
  const { id } = req.params;
  const { nome, preco } = req.body;
  const barbeiroId = req.usuario.id;

  try {
    const [servico] = await db.query(
      'SELECT id FROM servicos WHERE id = ? AND barbeiro_id = ?',
      [id, barbeiroId]
    );

    if (servico.length === 0) {
      return res.status(404).json({ erro: 'Serviço não encontrado.' });
    }

    await db.query(
      'UPDATE servicos SET nome = ?, preco = ? WHERE id = ?',
      [nome, preco, id]
    );

    return res.status(200).json({ mensagem: 'Serviço atualizado com sucesso!' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// DESATIVAR SERVIÇO
const desativar = async (req, res) => {
  const { id } = req.params;
  const barbeiroId = req.usuario.id;

  try {
    const [servico] = await db.query(
      'SELECT id FROM servicos WHERE id = ? AND barbeiro_id = ?',
      [id, barbeiroId]
    );

    if (servico.length === 0) {
      return res.status(404).json({ erro: 'Serviço não encontrado.' });
    }

    await db.query(
      'UPDATE servicos SET ativo = FALSE WHERE id = ?',
      [id]
    );

    return res.status(200).json({ mensagem: 'Serviço desativado com sucesso!' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

module.exports = { listar, criar, editar, desativar };