const db = require('./Database');

class eventoModel {
  static async criarEvento(data) {
    const { titulo, descricao, imagem, criadoPor, dataEvento, local } = data;

    let conn;

    try {
      console.log("Iniciando transação para criação de evento...");
      conn = await db.beginTransaction();

      // Inserir na tabela `evento`
      console.log("Inserindo na tabela `evento` com:", { titulo, descricao, imagem, criadoPor, dataEvento, local });
      const eventoResult = await db.query(
        `INSERT INTO evento (titulo, descricao, imagem, pessoa_juridica_pessoa_idpessoa, data_evento, local) VALUES (?, ?, ?, ?, ?, ?)`,
        [titulo, descricao, imagem, criadoPor, dataEvento, local],
        conn
      );
      console.log("Resultado de inserção em `evento`:", eventoResult);

      // Confirmar transação
      await db.commitTransaction(conn);
      console.log("Evento criado com sucesso!");
      return eventoResult.insertId;
    } catch (error) {
      if (conn) await db.rollbackTransaction(conn);
      console.error("Erro ao criar evento:", error);
      throw error;
    }
  }

  static async buscarConteudosRecentes() {
    try {
      const [eventos] = await db.query(`
        SELECT * FROM evento 
        WHERE data_evento >= NOW() OR data_criacao >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY data_evento , data_criacao DESC
        LIMIT 10
      `);
      console.log('Conteúdos recentes retornados do banco de dados:', eventos); // Adicione este log para verificar os eventos
      return Array.isArray(eventos) ? eventos : [eventos]; // Certifique-se de retornar uma lista
    } catch (error) {
      console.error('Erro ao buscar conteúdos recentes:', error);
      throw error;
    }
  }

  static async buscarEventoPorId(eventoId) {
    try {
      const [evento] = await db.query(`SELECT * FROM evento WHERE id_evento = ?`, [eventoId]);
      console.log('Evento retornado do banco de dados:', evento); // Adicione este log para verificar o evento
      return evento[0];
    } catch (error) {
      console.error('Erro ao buscar evento por ID:', error);
      throw error;
    }
  }
}

module.exports = eventoModel;