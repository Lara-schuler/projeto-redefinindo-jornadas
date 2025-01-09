const db = require('./Database');

class ServicoModel {
  static async criarServico(data) {
    const {
      titulo, descricao, local, imagem, pessoa_id,
    } = data;

    let conn;

    try {
      conn = await db.beginTransaction();

      // Inserir na tabela `evento`
      const servicoResult = await db.query(
        'INSERT INTO servico (titulo, descricao, local, imagem, pessoa_id) VALUES (?, ?, ?, ?, ?)',
        [titulo, descricao, local, imagem, pessoa_id],
        conn,
      );

      // Confirmar transação
      await db.commitTransaction(conn);
      return servicoResult.insertId;
    } catch (error) {
      if (conn) await db.rollbackTransaction(conn);
      console.error('Erro ao criar servico:', error);
      throw error;
    }
  }

  static async buscarServicosRecentes() {
    try {
      const servicos = await db.query(`
                SELECT 
                    s.*, 
                    p.nome AS nome_usuario, 
                    u.img_perfil AS img_perfil_usuario
                FROM servico s
                JOIN pessoa p ON s.pessoa_id = p.id_pessoa
                JOIN usuario u ON p.id_pessoa = u.pessoa_id_pessoa
                WHERE 
                    (
                        s.data_criacao IS NOT NULL 
                        AND s.data_criacao >= DATE_SUB(NOW(), INTERVAL 30 DAY) -- Inclui serviços criados recentemente
                    )
                ORDER BY 
                    s.data_criacao DESC -- Ordena do mais recente para o mais antigo
                LIMIT 10;
            `);

      // Certifique-se de que a consulta sempre retorna um array
      if (!Array.isArray(servicos)) {
        return servicos ? [servicos] : []; // Retorna um array com o serviço ou um array vazio se não houver nada
      }

      return servicos; // Caso já seja um array
    } catch (error) {
      console.error('Erro ao buscar serviços recentes:', error);
      throw error;
    }
  }

  static async obterServicoPorId(idServico) {
    const query = `
            SELECT s.*, p.nome AS nome_usuario, u.img_perfil AS img_perfil_usuario
            FROM servico s
            LEFT JOIN usuario u ON u.pessoa_id_pessoa = s.pessoa_id
            LEFT JOIN pessoa p ON p.id_pessoa = u.pessoa_id_pessoa
            WHERE s.id_servico = ?
        `;
    const result = await db.query(query, [idServico]);
    return result[0];
  }
}

module.exports = ServicoModel;
