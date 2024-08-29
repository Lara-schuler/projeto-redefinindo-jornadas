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

    static async salvarTipoPerfil(usuarioId, tipoPerfil) {
        let sqlVerificar = '';
        let sqlInserir = '';
        const parametros = [usuarioId];
    
        switch (tipoPerfil) {
            case 'psr':
                sqlVerificar = `
                    SELECT 1 FROM psr WHERE pessoa_fisica_pessoa_idpessoa = 
                    (SELECT pessoa_id_pessoa FROM usuario WHERE id_usuario = ?)
                `;
                sqlInserir = `
                    INSERT INTO psr (pessoa_fisica_pessoa_idpessoa) 
                    SELECT pessoa_id_pessoa FROM usuario WHERE id_usuario = ?
                `;
                break;
            case 'instituicao_publica':
                sqlVerificar = `
                    SELECT 1 FROM instituicao_publica WHERE pessoa_juridica_pessoa_idpessoa = 
                    (SELECT pessoa_id_pessoa FROM usuario WHERE id_usuario = ?)
                `;
                sqlInserir = `
                    INSERT INTO instituicao_publica (pessoa_juridica_pessoa_idpessoa) 
                    SELECT pessoa_id_pessoa FROM usuario WHERE id_usuario = ?
                `;
                break;
            case 'ong':
                sqlVerificar = `
                    SELECT 1 FROM ong WHERE pessoa_juridica_pessoa_idpessoa = 
                    (SELECT pessoa_id_pessoa FROM usuario WHERE id_usuario = ?)
                `;
                sqlInserir = `
                    INSERT INTO ong (pessoa_juridica_pessoa_idpessoa) 
                    SELECT pessoa_id_pessoa FROM usuario WHERE id_usuario = ?
                `;
                break;
            case 'pessoa_fisica':
                sqlVerificar = `
                    SELECT 1 FROM pessoa_fisica WHERE pessoa_idpessoa = 
                    (SELECT pessoa_id_pessoa FROM usuario WHERE id_usuario = ?)
                `;
                sqlInserir = `
                    INSERT INTO pessoa_fisica (pessoa_idpessoa) 
                    SELECT pessoa_id_pessoa FROM usuario WHERE id_usuario = ?
                `;
                break;
            case 'empresa':
                sqlVerificar = `
                    SELECT 1 FROM empresa WHERE pessoa_juridica_pessoa_idpessoa = 
                    (SELECT pessoa_id_pessoa FROM usuario WHERE id_usuario = ?)
                `;
                sqlInserir = `
                    INSERT INTO empresa (pessoa_juridica_pessoa_idpessoa) 
                    SELECT pessoa_id_pessoa FROM usuario WHERE id_usuario = ?
                `;
                break;
            case 'admin':
                throw new Error('Admin não precisa de uma tabela separada.');
            default:
                throw new Error('Tipo de perfil inválido.');
        }
    
        try {
            // Verificar se já existe
            const [rowsVerificar] = await db.query(sqlVerificar, parametros);
            console.log('rowsVerificar:', rowsVerificar); // Adicionar log para verificar o resultado
    
            if (Array.isArray(rowsVerificar) && rowsVerificar.length === 0) {
                // Registro não existe, então insira
                const [result] = await db.query(sqlInserir, parametros);
                console.log('Result:', result); // Adicionar log do resultado da inserção
    
                if (result.affectedRows === 0) {
                    throw new Error('Falha na inserção.');
                }
            } else {
                console.log("Registro já existente.");
            }
        } catch (error) {
            console.error('Erro no banco de dados:', error); // Logar o erro detalhado
            throw new Error('Erro ao atualizar tipo de perfil no banco de dados.');
        }
    }    
    
}

module.exports = Usuario;

