const db = require('./Database');

class eventoModel {
  static async criarEvento(data) {
    const { titulo, descricao, imagem, criadoPor, dataEvento, local } = data;

    let conn;

    try {
      conn = await db.beginTransaction();

      // Inserir na tabela `evento`
      const eventoResult = await db.query(
        `INSERT INTO evento (titulo, descricao, imagem, pessoa_juridica_pessoa_idpessoa, data_evento, local) VALUES (?, ?, ?, ?, ?, ?)`,
        [titulo, descricao, imagem, criadoPor, dataEvento, local],
        conn
      );

      // Confirmar transação
      await db.commitTransaction(conn);
      return eventoResult.insertId;
    } catch (error) {
      if (conn) await db.rollbackTransaction(conn);
      console.error("Erro ao criar evento:", error);
      throw error;
    }
  }

  static async buscarConteudosRecentes() {
    try {
      const eventos = await db.query(`
          SELECT 
              e.*, 
              p.nome AS nome_usuario, 
              u.img_perfil AS img_perfil_usuario
          FROM evento e
          JOIN pessoa p ON e.pessoa_juridica_pessoa_idpessoa = p.id_pessoa
          JOIN usuario u ON p.id_pessoa = u.pessoa_id_pessoa
          WHERE 
              (
                  e.data_evento IS NOT NULL 
                  AND e.data_evento >= NOW() -- Inclui eventos futuros
              ) 
              OR 
              (
                  e.data_criacao IS NOT NULL 
                  AND e.data_criacao >= DATE_SUB(NOW(), INTERVAL 30 DAY) -- Inclui eventos criados recentemente
              )
              OR 
              (
                  e.data_evento IS NULL -- Inclui eventos sem data definida
                  AND e.data_criacao >= DATE_SUB(NOW(), INTERVAL 30 DAY) -- Mas criados nos últimos 30 dias
              )
          ORDER BY 
              CASE 
                  WHEN e.data_evento >= NOW() THEN 1 -- Prioriza eventos futuros
                  WHEN e.data_criacao >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 2 -- Depois eventos recentes
                  ELSE 3 -- Por último, eventos sem data futura ou criados recentemente
              END,
              e.data_evento ASC,  -- Dentro dos futuros, ordena por proximidade
              e.data_criacao DESC -- Dentro dos recentes, ordena pelo mais recente
          LIMIT 10;
        `);

      if (!Array.isArray(eventos)) {
        return eventos ? [eventos] : []; // Retorna um array com o evento ou um array vazio se não houver nada
      }

      return eventos; // Caso já seja um array
    } catch (error) {
      console.error('Erro ao buscar conteúdos recentes:', error);
      throw error;
    }
  }

  static async buscarEventoPorId(eventoId) {
    try {
      const [evento] = await db.query(
        `
          SELECT 
              e.id_evento, 
              e.titulo, 
              e.descricao, 
              DATE_FORMAT(e.data_evento, '%Y-%m-%d %H:%i:%s') AS data_evento, 
              e.imagem, 
              e.local, 
              e.pessoa_juridica_pessoa_idpessoa,
              p.nome AS nome_usuario,
              u.img_perfil AS img_perfil_usuario
          FROM evento e
          JOIN pessoa p ON e.pessoa_juridica_pessoa_idpessoa = p.id_pessoa
          JOIN usuario u ON p.id_pessoa = u.pessoa_id_pessoa
          WHERE e.id_evento = ?
          `,
        [eventoId]
      );
      return Array.isArray(evento) ? evento : [evento];
    } catch (error) {
      console.error('Erro ao buscar evento por ID:', error);
      throw error;
    }
  }
}


module.exports = eventoModel;