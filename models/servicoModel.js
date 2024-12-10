const db = require('./Database');

class ServicoModel {
    static async criarServico({ idServico, titulo, descricao, local, imagem }) {
        const connection = await db.getConnection(); // Obtem uma conexão
        try {
            await connection.beginTransaction(); // Inicia a transação

            const query = `
                UPDATE servico 
                SET titulo = ?, descricao = ?, local = ?, imagem = ?
                WHERE id_servico = ?
            `;

            await connection.query(query, [titulo, descricao, local || null, imagem || null, idServico]);

            await connection.commit(); // Confirma a transação
        } catch (error) {
            await connection.rollback(); // Desfaz em caso de erro
            throw error; // Relança o erro para o controller tratar
        } finally {
            connection.release(); // Libera a conexão
        }
    }

    static async obterServicoPorId(idServico) {
        const query = `SELECT * FROM servico WHERE id_servico = ?`;
        const [result] = await db.query(query, [idServico]);
        return result[0];
    }
}

module.exports = ServicoModel;
