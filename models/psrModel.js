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

    let conn;

    try {
      console.log("Iniciando transação para criação de perfil...");
      conn = await db.beginTransaction();

      // Atualizar na tabela `pessoa`
      console.log("Atualizando tabela `pessoa` com:", { nome, data_nasc, id_pessoa });
      const updatePessoaQuery = `
        UPDATE pessoa 
        SET nome = ?, data_nasc = ?
        WHERE id_pessoa = ?;
      `;
      const pessoaResult = await db.query(updatePessoaQuery, [nome, data_nasc, id_pessoa], conn);
      console.log("Resultado de atualização em `pessoa`:", pessoaResult);

      // Buscar o id_usuario correspondente ao id_pessoa
      console.log("Buscando `id_usuario` para `id_pessoa`:", id_pessoa);
      const usuarioResult = await db.query(
        `SELECT id_usuario FROM usuario WHERE pessoa_id_pessoa = ?`,
        [id_pessoa],
        conn
      );
      console.log("Resultado de `id_usuario`:", usuarioResult);

      if (!usuarioResult || usuarioResult.length === 0 || !usuarioResult[0]) {
        throw new Error("Usuário não encontrado.");
      }
      const id_usuario = usuarioResult[0].id_usuario;

      // Definir um valor padrão para `status_perfil` caso ele não seja fornecido
      const statusPerfil = 'criado'; // Ou use uma lógica para definir se ainda não foi criado

      console.log("Atualizando tabela `usuario` com:", {
        img_perfil,
        status_perfil: statusPerfil, // Passando a variável correta
        id_usuario
      });

      const updateUsuarioQuery = `
        UPDATE usuario 
        SET img_perfil = ?, status_perfil = ?
        WHERE id_usuario = ?;
      `;

      const usuarioUpdateResult = await db.query(updateUsuarioQuery, [img_perfil || 'default_path', statusPerfil, id_usuario], conn);
      console.log("Resultado de atualização em `usuario`:", usuarioUpdateResult);

      // Inserir na tabela `pessoa_fisica`
      console.log("Inserindo na tabela `pessoa_fisica`:", { id_pessoa, genero });
      const pessoaFisicaResult = await db.query(
        `INSERT INTO pessoa_fisica (pessoa_idpessoa, genero) VALUES (?, ?)`,
        [id_pessoa, genero],
        conn
      );
      console.log("Resultado de inserção em `pessoa_fisica`:", pessoaFisicaResult);

      // Inserir na tabela `psr`
      console.log("Inserindo na tabela `psr`:", { id_pessoa, necessidades_urg });
      const psrResult = await db.query(
        `INSERT INTO psr (pessoa_fisica_pessoa_idpessoa, necessidades_urg) VALUES (?, ?)`,
        [id_pessoa, necessidades_urg],
        conn
      );
      console.log("Resultado de inserção em `psr`:", psrResult);

      // Inserir na tabela `endereco`
      console.log("Inserindo na tabela `endereco` com:", {
        rua,
        numero_end,
        cep,
        bairro,
        municipio,
        uf,
        status
      });
      const enderecoResult = await db.query(
        `INSERT INTO endereco (rua, numero_end, cep, bairro, municipio, uf, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [rua, numero_end, cep, bairro, municipio, uf, status],
        conn
      );
      console.log("Resultado de `endereco`:", enderecoResult);

      if (!enderecoResult.insertId) {
        throw new Error("Falha ao inserir endereço.");
      }

      const enderecoId = enderecoResult.insertId;

      // Inserir na tabela de junção `endereco_pessoa`
      console.log("Inserindo na tabela `endereco_pessoa`:", { enderecoId, id_pessoa });
      const enderecoPessoaResult = await db.query(
        `INSERT INTO endereco_pessoa (endereco_id_endereco, pessoa_id_pessoa) VALUES (?, ?)`,
        [enderecoId, id_pessoa],
        conn
      );
      console.log("Resultado de inserção em `endereco_pessoa`:", enderecoPessoaResult);

      // Inserir na tabela `qualificacao`
      console.log("Inserindo na tabela `qualificacao` com:", { formacao });
      const qualificacaoResult = await db.query(
        `INSERT INTO qualificacao (formacao) VALUES (?)`,
        [formacao],
        conn
      );
      console.log("Resultado de `qualificacao`:", qualificacaoResult);

      const qualificacaoId = qualificacaoResult.insertId;

      // Inserir na tabela de junção `psr_has_qualificacao`
      console.log("Inserindo na tabela `psr_has_qualificacao`:", { id_pessoa, qualificacaoId });
      const psrHasQualificacaoResult = await db.query(
        `INSERT INTO psr_has_qualificacao (psr_pessoa_fisica_pessoa_idpessoa, qualificacao_id_qualificacao) VALUES (?, ?)`,
        [id_pessoa, qualificacaoId],
        conn
      );
      console.log("Resultado de inserção em `psr_has_qualificacao`:", psrHasQualificacaoResult);

      // Inserir na tabela `interesse`
      console.log("Inserindo na tabela `interesse` com:", { tipo_interesse });
      const interesseResult = await db.query(
        `INSERT INTO interesse (tipo_interesse) VALUES (?)`,
        [tipo_interesse],
        conn
      );
      console.log("Resultado de `interesse`:", interesseResult);

      const interesseId = interesseResult.insertId;

      // Inserir na tabela de junção `psr_has_interesse`
      console.log("Inserindo na tabela `psr_has_interesse`:", { id_pessoa, interesseId });
      const psrHasInteresseResult = await db.query(
        `INSERT INTO psr_has_interesse (psr_pessoa_fisica_pessoa_idpessoa, interesse_id_interesse) VALUES (?, ?)`,
        [id_pessoa, interesseId],
        conn
      );
      console.log("Resultado de inserção em `psr_has_interesse`:", psrHasInteresseResult);

      // Inserir na tabela `condicao_medica`
      console.log("Inserindo na tabela `condicao_medica` com:", { historico_medico });
      const condicaoResult = await db.query(
        `INSERT INTO condicao_medica (historico_medico) VALUES (?)`,
        [historico_medico],
        conn
      );
      console.log("Resultado de `condicao_medica`:", condicaoResult);

      const condicaoId = condicaoResult.insertId;

      // Inserir na tabela de junção `psr_has_condicao_medica`
      console.log("Inserindo na tabela `psr_has_condicao_medica`:", { id_pessoa, condicaoId });
      const psrHasCondicaoResult = await db.query(
        `INSERT INTO psr_has_condicao_medica (psr_pessoa_fisica_pessoa_idpessoa, condicao_medica_id_condicao) VALUES (?, ?)`,
        [id_pessoa, condicaoId],
        conn
      );
      console.log("Resultado de inserção em `psr_has_condicao_medica`:", psrHasCondicaoResult);

      // Confirmar transação
      await db.commitTransaction(conn);
      console.log("Perfil criado com sucesso!");
      return id_pessoa;
    } catch (error) {
      if (conn) await db.rollbackTransaction(conn);
      console.error("Erro ao criar perfil:", error);
      throw error;
    }
  }
}

module.exports = psrModel;