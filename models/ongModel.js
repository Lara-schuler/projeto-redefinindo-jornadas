const db = require('./Database');

class ongModel {
  static async criarPerfilOng(data) {
    const {
      id_pessoa,
      img_perfil,
      nome,
      razao_social,
      cnpj,
      rua,
      numero_end,
      cep,
      bairro,
      municipio,
      uf,
      status,
      missao,
      tipo_servico,
      publico_alvo,
      dias_atendimento,
      horario_inicio,
      horario_final
    } = data;

    let conn;

    try {
      console.log("Iniciando transação para criação de perfil...");
      conn = await db.beginTransaction();

      // Atualizar na tabela `pessoa`
      console.log("Atualizando tabela `pessoa` com:", { nome, id_pessoa });
      const updatePessoaQuery = `
        UPDATE pessoa 
        SET nome = ?
        WHERE id_pessoa = ?;
      `;
      const pessoaResult = await db.query(updatePessoaQuery, [nome, id_pessoa], conn);
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
      console.log("Inserindo na tabela `pessoa_juridica`:", { id_pessoa, cnpj, missao, razao_social, dias_atendimento, horario_inicio, horario_final });
      const pessoaJuridicaResult = await db.query(
        `INSERT INTO pessoa_juridica (pessoa_idpessoa, cnpj, missao, razao_social, dias_atendimento, horario_inicio, horario_final) VALUES ( ?, ?, ?, ?, ?, ?, ?)`,
        [id_pessoa, cnpj, missao, razao_social, dias_atendimento, horario_inicio, horario_final],
        conn
      );
      console.log("Resultado de inserção em `pessoa_juridica`:", pessoaJuridicaResult);

      // Inserir na tabela `ong`
      console.log("Inserindo na tabela `ong`:", { id_pessoa, publico_alvo });
      const ongResult = await db.query(
        `INSERT INTO ong (pessoa_juridica_pessoa_idpessoa, publico_alvo) VALUES (?, ?)`,
        [id_pessoa, publico_alvo],
        conn
      );
      console.log("Resultado de inserção em `ong`:", ongResult);

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

      // Inserir na tabela `servico`
      console.log("Inserindo na tabela `servico` com:", { tipo_servico });
      const servicoResult = await db.query(
        `INSERT INTO servico (tipo_servico) VALUES (?)`,
        [tipo_servico],
        conn
      );
      console.log("Resultado de `servico`:", servicoResult);

      const servicoId = servicoResult.insertId;

      // Inserir na tabela de junção `servico_has_pessoa`
      console.log("Inserindo na tabela `servico_has_pessoa`:", { id_pessoa, servicoId });
      const servicoHasPessoaResult = await db.query(
        `INSERT INTO servico_has_pessoa (pessoa_id_pessoa, servico_id_servico) VALUES (?, ?)`,
        [id_pessoa, servicoId],
        conn
      );
      console.log("Resultado de inserção em `servico_has_pessoa`:", servicoHasPessoaResult);

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

module.exports = ongModel;