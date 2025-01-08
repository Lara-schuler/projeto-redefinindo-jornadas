const ServicoModel = require('../models/servicoModel');
const { definirMensagem } = require('./usuarioController');

const criarServico = async (req, res) => {
  try {
    const { titulo, descricao, local } = req.body;
    const usuario = req.session.user.id_pessoa; // ID da pessoa logada

    if (!usuario) {
      definirMensagem(req, 'error', 'Você precisa estar logado para criar um serviço.');
      return res.redirect('/login');
    }

    const imagem = req.file ? req.file.path : null;

    const servico = {
      titulo,
      descricao,
      local,
      imagem,
      pessoa_id: usuario, // Atribuindo a pessoa responsável pelo serviço
    };

    await ServicoModel.criarServico(servico); // Chama o método de criação de serviço no modelo

    definirMensagem(req, 'success', 'Serviço criado com sucesso!');
    res.redirect('/ong/feed-ong');
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    definirMensagem(req, 'error', 'Erro ao criar o serviço.');
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

    res.render('usuarios/exibir-servico', {
      layout: './layouts/default/exibir-servico',
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
