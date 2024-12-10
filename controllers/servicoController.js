const ServicoModel = require('../models/servicoModel');
const { definirMensagem } = require('./usuarioController');

const criarServico = async (req, res) => {
    try {
        const { titulo, descricao, local } = req.body;
        const usuario = req.session.user.id_pessoa; 

        if (!usuario) {
            definirMensagem(req, 'error', 'Você precisa estar logado para criar ou atualizar um serviço.');
            return res.redirect('/login');
        }

        // Verifica se há uma imagem enviada
        const imagem = req.file ? `/uploads/${req.file.filename}` : null;

        const servico = {
            idServico: usuario.id_servico, // ID do serviço associado à ONG
            titulo,
            descricao,
            local,
            imagem,
        };

        await ServicoModel.criarServico(servico);

        definirMensagem(req, 'success', 'Serviço salvo com sucesso!');
        res.redirect('/servicos/feed');
    } catch (error) {
        console.error('Erro ao criar ou atualizar serviço:', error);
        definirMensagem(req, 'error', 'Erro ao salvar o serviço.');
        res.redirect('/servicos/criar-servico');
    }
};

const exibirServico = async (req, res) => {
    try {
        const idServico = req.params.id;
        const servico = await ServicoModel.obterServicoPorId(idServico);

        if (!servico) {
            definirMensagem(req, 'error', 'Serviço não encontrado.');
            return res.redirect('/servicos/feed-ong');
        }

        res.render('servicos/exibir-servico', {
            layout: './layouts/default',
            title: servico.titulo,
            servico,
        });
    } catch (error) {
        console.error('Erro ao exibir serviço:', error);
        definirMensagem(req, 'error', 'Erro ao carregar o serviço.');
        res.redirect('/servicos/feed');
    }
};

module.exports = { criarServico, exibirServico };
