const db = require('./Database');
const path = require('path');

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
      const statusPerfil = 'criado'; 

      console.log("Atualizando tabela `usuario` com:", {
        img_perfil,
        status_perfil: statusPerfil, 
        id_usuario
      });

      const updateUsuarioQuery = `
        UPDATE usuario 
        SET img_perfil = ?, status_perfil = ?
        WHERE id_usuario = ?;
      `;

      const usuarioUpdateResult = await db.query(updateUsuarioQuery, [path.posix.normalize(img_perfil || 'img/default-user.jpg'), statusPerfil, id_usuario], conn);
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
      console.log("Inserindo na tabela `ong`:", { id_pessoa, publico_alvo, tipo_servico });
      const ongResult = await db.query(
        `INSERT INTO ong (pessoa_juridica_pessoa_idpessoa, publico_alvo, tipo_servico) VALUES (?, ?, ?)`,
        [id_pessoa, publico_alvo, tipo_servico],
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

  static async buscarPerfilOng(id_pessoa) {
    const query = `
        SELECT p.nome, pj.razao_social, pj.cnpj, e.rua, e.numero_end, e.cep, 
               e.bairro, e.municipio, e.uf, u.img_perfil, u.status_perfil, 
               pj.missao, o.tipo_servico, o.publico_alvo, pj.dias_atendimento, 
               pj.horario_inicio, pj.horario_final, e.status AS endereco_status
        FROM pessoa p
        JOIN pessoa_juridica pj ON p.id_pessoa = pj.pessoa_idpessoa
        JOIN ong o ON pj.pessoa_idpessoa = o.pessoa_juridica_pessoa_idpessoa
        JOIN endereco_pessoa ep ON p.id_pessoa = ep.pessoa_id_pessoa
        JOIN endereco e ON ep.endereco_id_endereco = e.id_endereco
        JOIN usuario u ON p.id_pessoa = u.pessoa_id_pessoa
        WHERE p.id_pessoa = ?;
    `;
  
    const resultados = await db.query(query, [id_pessoa]);
    return resultados[0] || null;
  }
  
  static async atualizarPerfilOng(dados) {
    const {
      id_pessoa, nome, razao_social, cnpj, rua, numero_end, cep, bairro, municipio, uf,
      img_perfil, status, missao, tipo_servico, publico_alvo, dias_atendimento, horario_inicio, horario_final
    } = dados;

    let conn;
    try {
      conn = await db.beginTransaction();

      const updatePessoa = `UPDATE pessoa SET nome = ? WHERE id_pessoa = ?;`;
      await db.query(updatePessoa, [nome, id_pessoa], conn);

      const updateUsuario = `
        UPDATE usuario 
        SET img_perfil = COALESCE(?, img_perfil) 
        WHERE pessoa_id_pessoa = ?;
      `;
      await db.query(updateUsuario, [path.posix.normalize(img_perfil || 'img/default-user.jpg'), id_pessoa], conn);

      const updateEndereco = `
            UPDATE endereco e
            JOIN endereco_pessoa ep ON e.id_endereco = ep.endereco_id_endereco
            SET e.rua = ?, e.numero_end = ?, e.cep = ?, e.bairro = ?, e.municipio = ?, e.uf = ?
            WHERE ep.pessoa_id_pessoa = ?;
        `;
      await db.query(updateEndereco, [rua, numero_end, cep, bairro, municipio, uf, id_pessoa], conn);

      const updatePessoaJuridica = `
            UPDATE pessoa_juridica 
            SET razao_social = ?, cnpj = ?, missao = ?, dias_atendimento = ?, horario_inicio = ?, horario_final = ?
            WHERE pessoa_idpessoa = ?;
        `;
      await db.query(updatePessoaJuridica, [razao_social, cnpj, missao, dias_atendimento, horario_inicio, horario_final, id_pessoa], conn);

      const updateOng = `UPDATE ong SET tipo_servico = ?, publico_alvo = ? WHERE pessoa_juridica_pessoa_idpessoa = ?;`;
      await db.query(updateOng, [tipo_servico, publico_alvo, id_pessoa], conn);

      await db.commitTransaction(conn);
    } catch (error) {
      if (conn) await db.rollbackTransaction(conn);
      throw error;
    }
  }

}

module.exports = ongModel;