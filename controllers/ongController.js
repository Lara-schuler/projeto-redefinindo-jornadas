const ongModel = require('../models/ongModel');
const usuarioModel = require('../models/usuarioModel');

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
        horario_final,
        horario
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


module.exports = { criarPerfilOng }