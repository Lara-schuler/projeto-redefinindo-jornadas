const ongModel = require('../models/ongModel');
const usuarioModel = require('../models/usuarioModel');
const eventoModel = require('../models/eventoModel');

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

    // Responde com sucesso
    res.status(201).json({ message: 'Perfil de ONG criado com sucesso!', usuarioId });
  } catch (error) {
    console.error('Erro ao criar perfil de ONG:', error);
    res.status(500).json({ message: 'Erro ao criar perfil de ONG', error: error.message });
    }
  };

  const exibirFeedOng = async (req, res) => {
    try {
      const conteudosRecentes = await eventoModel.buscarConteudosRecentes();
      console.log('Conteúdos recentes encontrados:', conteudosRecentes); // Adicione este log para verificar os conteúdos
  
      // Verificar se conteudosRecentes é uma lista (array)
      if (Array.isArray(conteudosRecentes)) {
        console.log('conteudosRecentes é uma lista:', conteudosRecentes);
      } else {
        console.log('conteudosRecentes não é uma lista:', conteudosRecentes);
      }
  
      res.render('usuarios/ong/feed-ong', {
        layout: './layouts/default/feed-ong',
        title: 'Feed ONG',
        usuario: req.session.user,
        conteudos: conteudosRecentes // Certifique-se de passar a variável conteudos como uma lista
      });
    } catch (error) {
      console.error('Erro ao buscar conteúdos recentes:', error);
      res.status(500).json({ message: 'Erro ao buscar conteúdos recentes', error: error.message });
    }
  };
  
  module.exports = { criarPerfilOng, exibirFeedOng };