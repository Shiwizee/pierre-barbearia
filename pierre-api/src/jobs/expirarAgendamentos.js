const cron = require('node-cron');
const db = require('../config/database');

// Roda a cada 30 minutos
function iniciarExpiracaoAutomatica() {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const [resultado] = await db.query(
        `UPDATE agendamentos 
         SET status = 'concluido'
         WHERE status IN ('pendente', 'confirmado')
         AND TIMESTAMP(data, horario) <= DATE_SUB(NOW(), INTERVAL 4 HOUR)`
      );

      if (resultado.affectedRows > 0) {
        console.log(`[Cron] ${resultado.affectedRows} agendamento(s) expirado(s) marcado(s) como concluído.`);
      }
    } catch (erro) {
      console.error('[Cron] Erro ao expirar agendamentos:', erro);
    }
  });

  console.log('[Cron] Tarefa de expiração automática iniciada.');
}

module.exports = { iniciarExpiracaoAutomatica };