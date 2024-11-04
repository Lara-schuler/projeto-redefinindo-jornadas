const db = require('./Database');

class psrModel {
  static async criarPerfilPsr(data) {
    const {
      id_pessoa,
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
      tipo_interesse,
      historico_medico
    } = data;

    try {
      // Log para verificar os dados recebidos
      console.log("Dados recebidos para criar perfil:", data);

      // Atualizar na tabela `pessoa`
      const updatePessoaQuery = `
        UPDATE pessoa 
        SET nome = ?, data_nasc = ?
        WHERE id_pessoa = ?;
      `;
      await db.query(updatePessoaQuery, [nome, data_nasc, id_pessoa]);
      console.log("Atualização na tabela pessoa concluída.");

      // Busca o id_usuario correspondente ao id_pessoa
      const usuarioResult = await db.query(
        `SELECT id_usuario FROM usuario WHERE pessoa_id_pessoa = ?`, 
        [id_pessoa]
      );
      
      // Log para inspecionar o resultado da consulta
      console.log("Resultado da query de busca de id_usuario:", usuarioResult);

      // Verifica se o resultado é válido antes de acessar
      if (!usuarioResult || usuarioResult.length === 0 || !usuarioResult[0]) {
        throw new Error("Usuário não encontrado ou resultado inesperado ao buscar id_usuario.");
      }

      // Acessa corretamente o id_usuario
      const id_usuario = usuarioResult[0].id_usuario;
      console.log("ID do usuário encontrado:", id_usuario);


      // Atualizar a tabela `usuario` usando id_usuario
      const updateUsuarioQuery = `
        UPDATE usuario 
        SET img_perfil = ?, status_perfil = ?
        WHERE id_usuario = ?;
      `;
      await db.query(updateUsuarioQuery, [img_perfil || 'default_path', 'criado', id_usuario]);
      console.log("Atualização na tabela usuario concluída. Status do perfil definido como 'criado'.");

      // Inserir na tabela `pessoa_fisica`
      await db.query(
        `INSERT INTO pessoa_fisica (pessoa_idpessoa, genero) VALUES (?, ?)`,
        [id_pessoa, genero]
      );
      console.log("Inserção na tabela pessoa_fisica concluída.");

      // Inserir na tabela `psr`
      await db.query(
        `INSERT INTO psr (pessoa_fisica_pessoa_idpessoa, necessidades_urg) VALUES (?, ?)`,
        [id_pessoa, necessidades_urg]
      );
      console.log("Inserção na tabela psr concluída.");

      // Inserir na tabela `endereco`
      const [enderecoResult] = await db.query(
        `INSERT INTO endereco (rua, numero_end, cep, bairro, municipio, uf, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [rua, numero_end, cep, bairro, municipio, uf, status]
      );
      console.log("Inserção na tabela endereco concluída.");

      if (!enderecoResult.insertId) {
        throw new Error("Falha ao inserir endereço");
      }

      const enderecoId = enderecoResult.insertId;
      console.log("ID do endereço inserido:", enderecoId);

      // Inserir na tabela de junção `endereco_pessoa`
      await db.query(
        `INSERT INTO endereco_pessoa (endereco_id_endereco, pessoa_id_pessoa) VALUES (?, ?)`,
        [enderecoId, id_pessoa]
      );
      console.log("Inserção na tabela endereco_pessoa concluída.");

      // Inserir na tabela `qualificacao`
      const [qualificacaoResult] = await db.query(
        `INSERT INTO qualificacao (formacao) VALUES (?)`,
        [formacao]
      );
      console.log("Inserção na tabela qualificacao concluída.");

      const qualificacaoId = qualificacaoResult.insertId;
      console.log("ID da qualificação inserida:", qualificacaoId);

      // Inserir na tabela de junção `psr_has_qualificacao`
      await db.query(
        `INSERT INTO psr_has_qualificacao (psr_pessoa_fisica_pessoa_idpessoa, qualificacao_id_qualificacao) VALUES (?, ?)`,
        [id_pessoa, qualificacaoId]
      );
      console.log("Inserção na tabela psr_has_qualificacao concluída.");

      // Inserir na tabela `interesse`
      const [interesseResult] = await db.query(
        `INSERT INTO interesse (tipo_interesse) VALUES (?)`,
        [tipo_interesse]
      );
      console.log("Inserção na tabela interesse concluída.");

      const interesseId = interesseResult.insertId;
      console.log("ID do interesse inserido:", interesseId);

      // Inserir na tabela de junção `psr_has_interesse`
      await db.query(
        `INSERT INTO psr_has_interesse (psr_pessoa_fisica_pessoa_idpessoa, interesse_id_interesse) VALUES (?, ?)`,
        [id_pessoa, interesseId]
      );
      console.log("Inserção na tabela psr_has_interesse concluída.");

      // Inserir na tabela `condicao_medica`
      const [condicaoResult] = await db.query(
        `INSERT INTO condicao_medica (historico_medico) VALUES (?)`,
        [historico_medico]
      );
      console.log("Inserção na tabela condicao_medica concluída.");

      const condicaoId = condicaoResult.insertId;
      console.log("ID da condição médica inserida:", condicaoId);

      // Inserir na tabela de junção `psr_has_condicao_medica`
      await db.query(
        `INSERT INTO psr_has_condicao_medica (psr_pessoa_fisica_pessoa_idpessoa, condicao_medica_id_condicao) VALUES (?, ?)`,
        [id_pessoa, condicaoId]
      );
      console.log("Inserção na tabela psr_has_condicao_medica concluída.");

      return id_pessoa;
    } catch (error) {
      console.error('Erro ao inserir dados:', error);
      throw error;
    }
  }
}

module.exports = psrModel;
