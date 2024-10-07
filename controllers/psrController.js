const psrModel = require('../models/psrModel');

const criarPerfilPsr = async (req, res) => {
  try {
    // Verifica se o upload de imagem foi realizado
    const img_perfil = req.file ? req.file.path : null; // Caminho do arquivo enviado

    // Coleta os dados do corpo da requisição
    const {
      nome,
      data_nasc,
      genero,
      rua,
      numero_end,
      cep,
      bairro,
      municipio,
      uf,
      status,
      necessidades_urg,
      formacao,
      ddd,
      numero,
      tipo_interesse,
      historico_medico
    } = req.body;

    // Organiza os dados para enviar ao model
    const perfilData = {
      img_perfil,
      nome,
      data_nasc,
      genero,
      rua,
      numero_end,
      cep,
      bairro,
      municipio,
      uf,
      status,
      necessidades_urg,
      formacao,
      ddd,
      numero,
      tipo_interesse,
      historico_medico
    };

    // Chama a função do model para salvar o perfil
    const usuarioId = await psrModel.criarPerfilPsr(perfilData);

    // Responde com sucesso
    res.status(201).json({ message: 'Perfil de PSR criado com sucesso!', usuarioId });
  } catch (error) {
    console.error('Erro ao criar perfil de PSR:', error);
    res.status(500).json({ message: 'Erro ao criar perfil de PSR', error: error.message });
  }
};

module.exports = { criarPerfilPsr };
