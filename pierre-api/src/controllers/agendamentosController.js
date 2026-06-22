const db = require('../config/database');

// LISTAR AGENDAMENTOS DO CLIENTE
const listarDoCliente = async (req, res) => {
  const clienteId = req.usuario.id;

  try {
    const [agendamentos] = await db.query(
      `SELECT a.id, a.data, a.horario, a.status, a.motivo_cancelamento,
              s.nome AS servico, s.preco,
              u.nome AS barbeiro
       FROM agendamentos a
       JOIN servicos s ON a.servico_id = s.id
       JOIN usuarios u ON a.barbeiro_id = u.id
       WHERE a.cliente_id = ?
       ORDER BY a.data ASC, a.horario ASC`,
      [clienteId]
    );

    return res.status(200).json(agendamentos);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// LISTAR AGENDAMENTOS DO BARBEIRO (com filtro de data)
const listarDoBarbeiro = async (req, res) => {
  const barbeiroId = req.usuario.id;
  const { data } = req.query; // ex: ?data=2024-06-13

  try {
    let query = `
      SELECT a.id, a.data, a.horario, a.status, a.motivo_cancelamento, a.agendado_por,
             s.nome AS servico, s.preco,
             u.nome AS cliente, u.apelido AS cliente_apelido, u.id AS cliente_id
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      JOIN usuarios u ON a.cliente_id = u.id
      WHERE a.barbeiro_id = ?
      AND a.status IN ('pendente', 'confirmado')
    `;

    const params = [barbeiroId];

    if (data) {
      query += ' AND a.data = ?';
      params.push(data);
    }

    query += ' ORDER BY a.data ASC, a.horario ASC';

    const [agendamentos] = await db.query(query, params);

    return res.status(200).json(agendamentos);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// CRIAR AGENDAMENTO
const criar = async (req, res) => {
  const { barbeiro_id, servico_id, data, horario } = req.body;
  const clienteId = req.usuario.id;

  try {
    // Verifica limite de 2 agendamentos ativos
    const [ativos] = await db.query(
      `SELECT id FROM agendamentos 
       WHERE cliente_id = ? 
       AND status IN ('pendente', 'confirmado')`,
      [clienteId]
    );
    
    if (ativos.length >= 2) {
      return res.status(400).json({ erro: 'Limite de 2 agendamentos simultâneos atingido.' });
    }

    // Verifica se o horário está bloqueado
    const [bloqueado] = await db.query(
      `SELECT id FROM horarios_bloqueados 
       WHERE barbeiro_id = ? AND data = ? AND horario = ?`,
      [barbeiro_id, data, horario]
    );

    if (bloqueado.length > 0) {
      return res.status(400).json({ erro: 'Este horário não está disponível.' });
    }

    // Verifica se o horário já está ocupado
    const [ocupado] = await db.query(
      `SELECT id FROM agendamentos 
       WHERE barbeiro_id = ? AND data = ? AND horario = ?
       AND status NOT IN ('cancelado_cliente', 'cancelado_barbeiro')`,
      [barbeiro_id, data, horario]
    );

    if (ocupado.length > 0) {
      return res.status(400).json({ erro: 'Este horário já está ocupado.' });
    }

    // Cria o agendamento
    await db.query(
      `INSERT INTO agendamentos 
       (cliente_id, barbeiro_id, servico_id, data, horario, status, agendado_por) 
       VALUES (?, ?, ?, ?, ?, 'pendente', 'cliente')`,
      [clienteId, barbeiro_id, servico_id, data, horario]
    );

    return res.status(201).json({ mensagem: 'Agendamento realizado com sucesso!' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// CRIAR AGENDAMENTO PELO BARBEIRO
const criarPeloBarbeiro = async (req, res) => {
  const { cliente_id, servico_id, data, horario } = req.body;
  const barbeiroId = req.usuario.id;

  try {
    // Verifica se o horário está bloqueado
    const [bloqueado] = await db.query(
      `SELECT id FROM horarios_bloqueados 
       WHERE barbeiro_id = ? AND data = ? AND horario = ?`,
      [barbeiroId, data, horario]
    );

    if (bloqueado.length > 0) {
      return res.status(400).json({ erro: 'Este horário está bloqueado.' });
    }

    // Verifica se o horário já está ocupado
    const [ocupado] = await db.query(
      `SELECT id FROM agendamentos 
       WHERE barbeiro_id = ? AND data = ? AND horario = ?
       AND status NOT IN ('cancelado_cliente', 'cancelado_barbeiro')`,
      [barbeiroId, data, horario]
    );

    if (ocupado.length > 0) {
      return res.status(400).json({ erro: 'Este horário já está ocupado.' });
    }

    await db.query(
      `INSERT INTO agendamentos 
       (cliente_id, barbeiro_id, servico_id, data, horario, status, agendado_por) 
       VALUES (?, ?, ?, ?, ?, 'confirmado', 'barbeiro')`,
      [cliente_id, barbeiroId, servico_id, data, horario]
    );

    return res.status(201).json({ mensagem: 'Agendamento realizado com sucesso!' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// CANCELAR AGENDAMENTO PELO CLIENTE
const cancelarPeloCliente = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  const clienteId = req.usuario.id;

  try {
    if (!motivo || motivo.trim() === '') {
      return res.status(400).json({ erro: 'O motivo do cancelamento é obrigatório.' });
    }

    const [agendamento] = await db.query(
      'SELECT * FROM agendamentos WHERE id = ? AND cliente_id = ?',
      [id, clienteId]
    );

    if (agendamento.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    await db.query(
      `UPDATE agendamentos SET status = 'cancelado_cliente', motivo_cancelamento = ? WHERE id = ?`,
      [motivo, id]
    );

    return res.status(200).json({ mensagem: 'Agendamento cancelado com sucesso.' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// CANCELAR AGENDAMENTO PELO BARBEIRO
const cancelarPeloBarbeiro = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    const [agendamento] = await db.query(
      'SELECT * FROM agendamentos WHERE id = ?',
      [id]
    );

    if (agendamento.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    await db.query(
      `UPDATE agendamentos 
       SET status = 'cancelado_barbeiro', motivo_cancelamento = ?, notificado = FALSE
       WHERE id = ?`,
      [motivo, id]
    );

    return res.status(200).json({ mensagem: 'Agendamento cancelado com sucesso.' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// MARCAR COMO CONCLUÍDO
const marcarConcluido = async (req, res) => {
  const { id } = req.params;

  try {
    const [agendamento] = await db.query(
      'SELECT * FROM agendamentos WHERE id = ?',
      [id]
    );

    if (agendamento.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    await db.query(
      `UPDATE agendamentos SET status = 'concluido' WHERE id = ?`,
      [id]
    );

    return res.status(200).json({ mensagem: 'Agendamento marcado como concluído!' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// MARCAR COMO NÃO COMPARECEU
const marcarNaoCompareceu = async (req, res) => {
  const { id } = req.params;

  try {
    const [agendamento] = await db.query(
      'SELECT * FROM agendamentos WHERE id = ?',
      [id]
    );

    if (agendamento.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    await db.query(
      `UPDATE agendamentos SET status = 'nao_compareceu' WHERE id = ?`,
      [id]
    );

    return res.status(200).json({ mensagem: 'Agendamento marcado como não compareceu.' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// LISTAR PRÓXIMOS AGENDAMENTOS (barbeiro) - os 3 mais próximos a partir de agora
const listarProximos = async (req, res) => {
  const barbeiroId = req.usuario.id;

  try {
    const [agendamentos] = await db.query(
      `SELECT a.id, a.data, a.horario, a.status,
              s.nome AS servico, s.preco,
              u.nome AS cliente, u.apelido AS cliente_apelido, u.id AS cliente_id
       FROM agendamentos a
       JOIN servicos s ON a.servico_id = s.id
       JOIN usuarios u ON a.cliente_id = u.id
       WHERE a.barbeiro_id = ?
       AND a.status IN ('pendente', 'confirmado')
       AND TIMESTAMP(a.data, a.horario) >= NOW()
       ORDER BY a.data ASC, a.horario ASC
       LIMIT 3`,
      [barbeiroId]
    );

    return res.status(200).json(agendamentos);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// HISTÓRICO DO CLIENTE
const historicoCliente = async (req, res) => {
  const clienteId = req.usuario.id;

  try {
    const [agendamentos] = await db.query(
      `SELECT a.id, a.data, a.horario, a.status, a.motivo_cancelamento,
              s.nome AS servico, s.preco
       FROM agendamentos a
       JOIN servicos s ON a.servico_id = s.id
       WHERE a.cliente_id = ?
       AND a.status IN ('concluido', 'nao_compareceu', 'cancelado_cliente', 'cancelado_barbeiro')
       ORDER BY a.data DESC, a.horario DESC`,
      [clienteId]
    );

    return res.status(200).json(agendamentos);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// HISTÓRICO DO BARBEIRO
const historicoBarbeiro = async (req, res) => {
  const barbeiroId = req.usuario.id;
  const { status } = req.query;

  try {
    let query = `
      SELECT a.id, a.data, a.horario, a.status, a.motivo_cancelamento, a.agendado_por,
             s.nome AS servico, s.preco,
             u.nome AS cliente, u.apelido AS cliente_apelido
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      JOIN usuarios u ON a.cliente_id = u.id
      WHERE a.barbeiro_id = ?
      AND a.status IN ('concluido', 'nao_compareceu', 'cancelado_cliente', 'cancelado_barbeiro')
    `;

    const params = [barbeiroId];

    if (status && status !== 'todos') {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.data DESC, a.horario DESC';

    const [agendamentos] = await db.query(query, params);

    return res.status(200).json(agendamentos);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// BUSCAR NOTIFICAÇÕES PENDENTES (cliente)
const notificacoesPendentes = async (req, res) => {
  const clienteId = req.usuario.id;

  try {
    const [notificacoes] = await db.query(
      `SELECT a.id, a.data, a.horario, a.motivo_cancelamento,
              s.nome AS servico
       FROM agendamentos a
       JOIN servicos s ON a.servico_id = s.id
       WHERE a.cliente_id = ?
       AND a.status = 'cancelado_barbeiro'
       AND a.notificado = FALSE`,
      [clienteId]
    );

    return res.status(200).json(notificacoes);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// MARCAR NOTIFICAÇÃO COMO VISTA
const marcarNotificado = async (req, res) => {
  const { id } = req.params;
  const clienteId = req.usuario.id;

  try {
    await db.query(
      `UPDATE agendamentos SET notificado = TRUE WHERE id = ? AND cliente_id = ?`,
      [id, clienteId]
    );

    return res.status(200).json({ mensagem: 'Notificação marcada como vista.' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

module.exports = {
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
};