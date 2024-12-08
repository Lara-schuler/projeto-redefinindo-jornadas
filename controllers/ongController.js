const ongModel = require('../models/ongModel');
const usuarioModel = require('../models/usuarioModel');
const eventoModel = require('../models/eventoModel');
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


  const exibirFeedOng = async (req, res) => {
    try {
      // Buscar os conteúdos recentes
      const conteudosRecentes = await eventoModel.buscarConteudosRecentes();
      console.log('Conteúdos recentes encontrados:', conteudosRecentes); // Adicione este log para verificar os conteúdos
  
      // Garantir que conteudosRecentes seja sempre um array
      const conteudos = Array.isArray(conteudosRecentes) ? conteudosRecentes : (conteudosRecentes ? [conteudosRecentes] : []);
  
      // Verifique no log se a variável é uma lista
      console.log('Conteúdos (como array):', conteudos);
  
      // Renderize a view, passando os conteúdos como um array
      res.render('usuarios/ong/feed-ong', {
        layout: './layouts/default/feed-ong',
        title: 'Feed ONG',
        usuario: req.session.user,
        conteudos: conteudos
      });
    } catch (error) {
      console.error('Erro ao buscar conteúdos recentes:', error);
      res.status(500).json({ message: 'Erro ao buscar conteúdos recentes', error: error.message });
    }
  };
  
  module.exports = { criarPerfilOng, exibirFeedOng };