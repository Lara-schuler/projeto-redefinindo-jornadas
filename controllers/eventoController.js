const eventoModel = require('../models/eventoModel');

const criarEvento = async (req, res) => {
  try {
    // Verifica se o upload de imagem foi realizado
    const imagem = req.file ? req.file.path : null;

    // Coleta os dados do corpo da requisição
    const { titulo, descricao, data_evento, local } = req.body;

    // Organiza os dados para enviar ao model
    const eventoData = {
      titulo,
      descricao,
      imagem,
      criadoPor: req.session.user.id_pessoa, 
      dataEvento: data_evento,
      local
    };

    // Chama a função do model para salvar o evento
    const eventoId = await eventoModel.criarEvento(eventoData);
    console.log('ID do evento criado:', eventoId);

    // Redireciona para o feed de ONG após a criação do evento
    res.redirect('/ong/feed-ong');
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ message: 'Erro ao criar evento', error: error.message });
  }
};

const exibirEvento = async (req, res) => {
  try {
    const eventoId = req.params.id;
    const evento = await eventoModel.buscarEventoPorId(eventoId);
    console.log('EventoId:', eventoId);
    if (!evento) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }
    res.render('usuarios/exibir-evento', {
      layout: './layouts/default/exibir-evento',
      title: evento.titulo,
      usuario: req.session.user,
      evento: evento
    });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ message: 'Erro ao buscar evento', error: error.message });
  }
};

const curtirEvento = async (req, res) => {
  // Lógica para curtir evento
};

const compartilharEvento = async (req, res) => {
  // Lógica para compartilhar evento
};

const participarEvento = async (req, res) => {
  // Lógica para indicar participação no evento
};

module.exports = { criarEvento, exibirEvento, curtirEvento, compartilharEvento, participarEvento };