const db = require('./Database');
const md5 = require('md5');

class Usuario {
    static async autenticar(emailOuTelefone, senha) {
        let sql = `SELECT p.* 
                   FROM pessoa p
                   JOIN usuario u ON u.pessoa_id_pessoa = p.id_pessoa
                   LEFT JOIN telefone t ON p.id_pessoa = t.pessoa_id_pessoa
                   WHERE (p.email = ? OR (CONCAT(t.ddd, t.numero) = ?)) AND u.senha = ?`;
        console.log(sql);
        return await db.query(sql, [emailOuTelefone, emailOuTelefone.replace(/\D/g, ''), md5(senha)]);
    }
    

    static async criarConta(email, telefone, senha) {
        // Inserir na tabela pessoa
        let sqlPessoa = `INSERT INTO pessoa (email) VALUES (?)`;
        console.log(sqlPessoa);
        await db.query(sqlPessoa, [email]);

        // Obter o ID da pessoa recém inserida
        let sqlGetPessoaId = `SELECT id_pessoa FROM pessoa WHERE email = ?`;
        console.log(sqlGetPessoaId);
        let result = await db.query(sqlGetPessoaId, [email]);
        let pessoaId = result[0].id_pessoa;

        // Inserir na tabela usuario
        let sqlUsuario = `INSERT INTO usuario (pessoa_id_pessoa, senha) VALUES (?, ?)`;
        console.log(sqlUsuario);
        await db.query(sqlUsuario, [pessoaId, md5(senha)]);

        // Inserir na tabela telefone se fornecido
        if (telefone) {
            let sqlTelefone = `INSERT INTO telefone (ddd, numero, pessoa_id_pessoa) VALUES (?, ?, ?)`;
            console.log(sqlTelefone);
            
            let ddd = telefone.substring(0, 2); 
            let numero = telefone.substring(2); 
            await db.query(sqlTelefone, [ddd, numero, pessoaId]);
        }
    }

    static async buscarPorEmail(email) {
        let sql = `SELECT * FROM pessoa WHERE email = ?`;
        console.log(sql);
        return await db.query(sql, [email]);
    }

    static async buscarPorTelefone(numero) {
        let sql = `SELECT * FROM telefone WHERE numero = ?`;
        console.log(sql);
        return await db.query(sql, [numero]);
    }

    static async atualizarToken(email, token, expiration) {
        let sql = `UPDATE pessoa SET reset_token = ?, token_expiration = ? WHERE email = ?`;
        console.log(sql);
        return await db.query(sql, [token, expiration.toISOString(), email]);
    }
    
    

    static async atualizarSenha(email, senha) {
        let sql = `UPDATE usuario u
                   JOIN pessoa p ON u.pessoa_id_pessoa = p.id_pessoa
                   SET u.senha = ?
                   WHERE p.email = ?`;
        console.log(sql);
        return await db.query(sql, [md5(senha), email]);
    }

    static async limparToken(email) {
        let sql = `UPDATE pessoa SET reset_token = NULL, token_expiration = NULL WHERE email = ?`;
        console.log(sql);
        return await db.query(sql, [email]);
    }

    static async atualizarTipoPerfil(idUsuario, tipoPerfil) {
        const sql = 'UPDATE usuario SET tipo_perfil = ? WHERE id_usuario = ?';
        const parametros = [tipoPerfil, idUsuario];
    
        try {
            await db.query(sql, parametros);
            console.log('Tipo de perfil atualizado com sucesso para:', tipoPerfil); // Log para depuração
        } catch (error) {
            console.error('Erro ao atualizar tipo de perfil:', error);
            throw new Error('Erro ao atualizar tipo de perfil.');
        }
    }    
    
    static async obterUsuarioPorId(pessoaId) {
        const sql = 'SELECT * FROM usuario WHERE pessoa_id_pessoa = ?';
        const parametros = [pessoaId];
    
        console.log('Buscando usuário com ID de pessoa:', pessoaId); // Log para depuração
    
        try {
            const [rows] = await db.query(sql, parametros);
            console.log('Resultado da busca do usuário:', rows); // Log para depuração
    
            // Verifica se há resultados na consulta
            if (rows.length > 0) {
                return rows[0]; // Retorna o usuário encontrado
            } else {
                // Se não encontrou resultados, lança a exceção
                throw new Error('Usuário não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao buscar usuário no banco de dados:', error);
            throw new Error('Erro ao buscar usuário no banco de dados.');
        }
    }    
    
}

module.exports = Usuario;

