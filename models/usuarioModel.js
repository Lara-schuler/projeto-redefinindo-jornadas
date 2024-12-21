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
        const [ddd, numero] = [telefone.substring(0, 2), telefone.substring(2)];
        const conn = await db.beginTransaction();
    
        try {
            const pessoaResult = await db.query(
                `INSERT INTO pessoa (email) VALUES (?)`,
                [email],
                conn
            );
    
            const idPessoa = pessoaResult.insertId;
    
            await db.query(
                `INSERT INTO telefone (ddd, numero, pessoa_id_pessoa) VALUES (?, ?, ?)`,
                [ddd, numero, idPessoa],
                conn
            );
    
            await db.query(
                `INSERT INTO usuario (senha, pessoa_id_pessoa) VALUES (?, ?)`,
                [md5(senha), idPessoa],
                conn
            );
    
            await db.commitTransaction(conn);
        } catch (error) {
            await db.rollbackTransaction(conn);
            throw error;
        }
    }
    
    static async buscarPorEmail(email) {
        let sql = `SELECT * FROM pessoa WHERE email = ?`;
        console.log(sql);
        return await db.query(sql, [email]);
    }

    static async buscarPorTelefone(telefone) {
        const [ddd, numero] = [telefone.substring(0, 2), telefone.substring(2)];
        let sql = `SELECT * FROM telefone WHERE ddd = ? AND numero = ?`;
        console.log(sql);
        const result = await db.query(sql, [ddd, numero]);
        return result.length > 0 ? result : [];
    }

    static async atualizarDados(idUsuario, email, telefone) {
        const sql = `
            UPDATE pessoa p
            JOIN usuario u ON p.id_pessoa = u.pessoa_id_pessoa
            SET p.email = ?, p.telefone = ?
            WHERE u.id_usuario = ?`;
        return await db.query(sql, [email, telefone, idUsuario]);
    }
    
    static async verificarSenha(idUsuario, senhaAtual) {
        const sql = `
            SELECT u.senha
            FROM usuario u
            WHERE u.id_usuario = ?`;
        const result = await db.query(sql, [idUsuario]);
    
        return result.length > 0 && result[0].senha === md5(senhaAtual);
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

    static async obterUsuarioPorId(id_pessoa) {
        const query = 'SELECT * FROM usuario WHERE pessoa_id_pessoa = ?';
        const result = await db.query(query, [id_pessoa]);

        console.log('Resultado da consulta de obterUsuarioPorId:', result); // Adicione este log

        if (result && result.length > 0) {
            return result[0]; // Retorne o primeiro usuário encontrado
        }
        return null; // Se não houver usuário, retorne null
    }

    static async atualizarStatusPerfil(id_usuario, status) {
        const query = 'UPDATE usuario SET status_perfil = ? WHERE id_usuario = ?';
        return await db.query(query, [status, id_usuario]);
    }

    static async verificarPerfil(usuarioId) {
        try {
            const query = `
                SELECT  
                    tipo_perfil,
                    status_perfil
                FROM usuario
                WHERE id_usuario = ?`;

            console.log('Executando query verificarPerfil:', query, usuarioId);
            const result = await db.query(query, [usuarioId]);
            console.log('Resultado da query verificarPerfil:', result);

            // Verifica se o usuário existe
            if (result.length === 0) {
                throw new Error('Usuário não encontrado');
            }

            // Retorna o status e tipo do perfil
            return {
                tipo_perfil: result[0].tipo_perfil,
                status_perfil: result[0].status_perfil,
            };
        } catch (error) {
            console.error('Erro ao verificar perfil:', error);
            throw error;
        }
    }
}

module.exports = Usuario;