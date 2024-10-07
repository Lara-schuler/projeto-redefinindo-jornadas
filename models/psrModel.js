const db = require('./Database');

class psrModel {
  static async criarPerfilPsr(data) {
    const {
      img_perfil,
      nome,
      data_nasc,
      genero,
      rua,
      numero_end,
      cep,
      bairro,
      municipio,
      uf,
      status,
      necessidades_urg,
      formacao,
      ddd,
      numero,
      tipo_interesse,
      historico_medico
    } = data;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Inserir na tabela `pessoa`
      const [usuarioResultResult] = await conn.query(
        `INSERT INTO pessoa (nome, data_nasc) VALUES (?, ?)`,
        [nome, data_nasc]
      );
      const usuarioId = usuarioResult.insertId;

      // Inserir na tabela `usuario`
      await conn.query(
        `INSERT INTO usuario (usuario_id, img_perfil) VALUES (?, ?)`,
        [usuarioId, img_perfil]
      );

      // Inserir na tabela `localizacao`
      await conn.query(
        `INSERT INTO localizacao (usuario_id, rua, numero_end, cep, bairro, municipio, uf, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [usuarioId, rua, numero_end, cep, bairro, municipio, uf, status]
      );

      // Inserir na tabela `qualificacao`
      await conn.query(
        `INSERT INTO qualificacao (usuario_id, formacao) VALUES (?, ?)`,
        [usuarioId, formacao]
      );

      // Inserir na tabela `telefone`
      await conn.query(
        `INSERT INTO telefone (usuario_id, ddd, numero) VALUES (?, ?, ?)`,
        [usuarioId, ddd, numero]
      );

      // Inserir na tabela `psr`
      await conn.query(
        `INSERT INTO psr (usuario_id, necessidades_urg) VALUES (?, ?)`,
        [usuarioId, necessidades_urg]
      );

      // Inserir na tabela `interesse`
      await conn.query(
        `INSERT INTO interesse (usuario_id, tipo_interesse) VALUES (?, ?)`,
        [usuarioId, tipo_interesse]
      );

      // Inserir na tabela `condicao_medica`
      await conn.query(
        `INSERT INTO condicao_medica (usuario_id, historico_medico) VALUES (?, ?)`,
        [usuarioId, historico_medico]
      );

      await conn.commit();
      return usuarioId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

module.exports = psrModel;
