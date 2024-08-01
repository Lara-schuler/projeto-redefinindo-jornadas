const db = require('./Database');
const md5 = require('md5');

class Usuario {
    static async autenticar(email, senha) {
        let sql = `SELECT p.* 
                   FROM pessoa p
                   JOIN usuario u ON u.pessoa_id_pessoa = p.id_pessoa
                   WHERE p.email = '${email}' AND u.senha = '${md5(senha)}'`;
        console.log(sql);
        return await db.query(sql);
    }

    static async criarConta(email, senha) {
        // Inserir na tabela pessoa
        let sqlPessoa = `INSERT INTO pessoa (email) VALUES ('${email}')`;
        console.log(sqlPessoa);
        await db.query(sqlPessoa);
    
        // Obter o ID da pessoa recém inserida
        let sqlGetPessoaId = `SELECT id_pessoa FROM pessoa WHERE email = '${email}'`;
        console.log(sqlGetPessoaId);
        let result = await db.query(sqlGetPessoaId);
        let pessoaId = result[0].id_pessoa;
    
        // Inserir na tabela usuario
        let sqlUsuario = `INSERT INTO usuario (pessoa_id_pessoa, senha) VALUES (${pessoaId}, '${md5(senha)}')`;
        console.log(sqlUsuario);
        return await db.query(sqlUsuario);
    }

    static async buscarPorEmail(email) {
        let sql = `SELECT * FROM pessoa WHERE email = '${email}'`;
        console.log(sql);
        return await db.query(sql);
    }

    static async checkEmailExists(email) {
        let result = await this.buscarPorEmail(email);
        return result.length > 0;
    }
}

module.exports = Usuario;
