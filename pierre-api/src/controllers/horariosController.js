const db = require('../config/database');

// LISTAR HORÁRIOS BLOQUEADOS E OCUPADOS DE UM DIA
const listarDisponibilidade = async (req, res) => {
  const { barbeiro_id, data } = req.query;

  try {
    // Busca horários bloqueados
    const [bloqueados] = await db.query(
      `SELECT horario FROM horarios_bloqueados 
       WHERE barbeiro_id = ? AND data = ?`,
      [barbeiro_id, data]
    );

    // Busca horários já agendados
    const [agendados] = await db.query(
      `SELECT horario FROM agendamentos 
       WHERE barbeiro_id = ? AND data = ?
       AND status NOT IN ('cancelado_cliente', 'cancelado_barbeiro')`,
      [barbeiro_id, data]
    );

    return res.status(200).json({
      bloqueados: bloqueados.map(h => h.horario),
      agendados: agendados.map(h => h.horario),
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// SALVAR BLOQUEIOS (barbeiro)
const salvarBloqueios = async (req, res) => {
  const { data, horarios } = req.body;
  const barbeiroId = req.usuario.id;

  // horarios é um array de objetos { horario, bloquear: true/false }
  // bloquear: true = bloquear, false = desbloquear

  try {
    for (const item of horarios) {
      if (item.bloquear) {
        // Verifica se já existe antes de inserir
        const [existe] = await db.query(
          `SELECT id FROM horarios_bloqueados 
           WHERE barbeiro_id = ? AND data = ? AND horario = ?`,
          [barbeiroId, data, item.horario]
        );

        if (existe.length === 0) {
          await db.query(
            'INSERT INTO horarios_bloqueados (barbeiro_id, data, horario) VALUES (?, ?, ?)',
            [barbeiroId, data, item.horario]
          );
        }
      } else {
        // Desbloqueia
        await db.query(
          `DELETE FROM horarios_bloqueados 
           WHERE barbeiro_id = ? AND data = ? AND horario = ?`,
          [barbeiroId, data, item.horario]
        );
      }
    }

    return res.status(200).json({ mensagem: 'Bloqueios salvos com sucesso!' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

module.exports = { listarDisponibilidade, salvarBloqueios };