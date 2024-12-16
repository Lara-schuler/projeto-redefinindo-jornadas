const ongModel = require('../models/ongModel');
const usuarioModel = require('../models/usuarioModel');
const eventoModel = require('../models/eventoModel');
const servicoModel = require('../models/servicoModel');
const { definirMensagem } = require('./usuarioController');

const criarPerfilOng = async (req, res) => {
  try {
    // Verifica se o upload de imagem foi realizado
    const img_perfil = req.file ? req.file.path : null;

    // Coleta os dados do corpo da requisição
    const {
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
    } = req.body;

    // status_perfil definido como 'nao_criado' por padrão
    const status_perfil = 'nao_criado';

    const id_pessoa = req.session.user.id_pessoa;

    // Organiza os dados para enviar ao model
    const perfilData = {
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
      horario_final,
      status_perfil
    };

    // Chama a função do model para salvar o perfil
    const usuarioId = await ongModel.criarPerfilOng(perfilData);
    console.log('ID do usuário criado:', usuarioId);

    // Atualiza o status do perfil na tabela usuario
    await usuarioModel.atualizarStatusPerfil(req.session.user.id_usuario, 'criado');

    // Mensagem de sucesso usando a função definirMensagem
    definirMensagem(req, 'success', 'Perfil de ONG criado com sucesso!');

    // Atualizando a sessão
    req.session.user.tipo_perfil = 'ong';
    req.session.user.status_perfil = 'criado';

    console.log('Sessão após atualização:', req.session.user);
    // Redireciona após o sucesso
    res.redirect('/ong/feed-ong');
  } catch (error) {
    console.error('Erro ao criar perfil de ONG:', error);

    // Mensagem de erro usando a função definirMensagem
    definirMensagem(req, 'error', 'Erro ao criar perfil de ONG: ' + error.message);

    // Redireciona após o erro
    res.redirect('/ong/criar-perfil');
  }
};

const exibirEditarPerfil = async (req, res) => {
  try {
    const id_pessoa = req.session.user.id_pessoa;
    const dadosPerfil = await ongModel.buscarPerfilOng(id_pessoa);

    if (!dadosPerfil) {
      throw new Error('Perfil não encontrado.');
    }

    res.render('usuarios/perfis/editar-ong', {
      layout: './layouts/default/editar-ong',
      title: 'Editar Perfil de ONG',
      usuario: req.session.user,
      ong: dadosPerfil
    });
  } catch (error) {
    console.error('Erro ao carregar o perfil para edição:', error);
    req.flash('error', 'Erro ao carregar o perfil para edição.');
    res.redirect('/ong/feed-ong');
  }
};

const editarPerfilOng = async (req, res) => {
  try {
    const id_pessoa = req.session.user.id_pessoa;
    const img_perfil = req.file ? req.file.path : req.body.img_atual; // Manter a imagem atual se não houver upload
    const dadosAtualizados = {
      ...req.body,
      id_pessoa,
      img_perfil
    };

    await ongModel.atualizarPerfilOng(dadosAtualizados);

    req.flash('success', 'Perfil atualizado com sucesso!');
    res.redirect('/ong/feed-ong');
  } catch (error) {
    console.error('Erro ao atualizar o perfil de ONG:', error);
    req.flash('error', 'Erro ao atualizar o perfil.');
    res.redirect('/ong/editar-perfil-ong');
  }
};



const exibirFeedOng = async (req, res) => {
  try {
    // Buscar os conteúdos recentes (eventos e serviços)
    const eventosRecentes = await eventoModel.buscarConteudosRecentes();
    const servicosRecentes = await servicoModel.buscarServicosRecentes();

    // Garantir que ambos sejam arrays
    const eventos = Array.isArray(eventosRecentes) ? eventosRecentes : [];
    const servicos = Array.isArray(servicosRecentes) ? servicosRecentes : [];

    // Renderizar a view com os conteúdos
    res.render('usuarios/ong/feed-ong', {
      layout: './layouts/default/feed-ong',
      title: 'Feed ONG',
      usuario: req.session.user,
      eventos,
      servicos
    });
  } catch (error) {
    console.error('Erro ao buscar conteúdos para o feed:', error);
    res.status(500).json({ message: 'Erro ao buscar conteúdos', error: error.message });
  }
};


module.exports = { criarPerfilOng, exibirFeedOng, exibirEditarPerfil, editarPerfilOng };