const eventoModel = require('../models/eventoModel');
const { definirMensagem } = require('./usuarioController'); // Importa a função

const criarEvento = async (req, res) => {
  try {
    // Verifica se o upload de imagem foi realizado
    const imagem = req.file ? req.file.path : null;

    // Coleta os dados do corpo da requisição
    const {
      titulo, descricao, data_evento, local,
    } = req.body;

    // Organiza os dados para enviar ao model
    const eventoData = {
      titulo,
      descricao,
      imagem,
      criadoPor: req.session.user.id_pessoa,
      dataEvento: data_evento,
      local,
    };

    // Chama a função do model para salvar o evento
    const eventoId = await eventoModel.criarEvento(eventoData);

    // Mensagem de sucesso usando a função definirMensagem
    definirMensagem(req, 'success', 'Evento criado com sucesso!');

    // Redireciona para o feed de ONG após a criação do evento
    res.redirect('/ong/feed-ong');
  } catch (error) {
    console.error('Erro ao criar evento:', error);

    // Mensagem de erro usando a função definirMensagem
    definirMensagem(req, 'error', `Erro ao criar evento: ${error.message}`);
    res.status(500).json({ message: 'Erro ao criar evento', error: error.message });
  }
};

const exibirEvento = async (req, res) => {
  try {
    const eventoId = req.params.id;
    const eventos = await eventoModel.buscarEventoPorId(eventoId);

    // Verificar se o retorno é um array e pegar o primeiro elemento
    const evento = Array.isArray(eventos) && eventos.length > 0 ? eventos[0] : null;

    if (!evento) {
      console.error('Evento não encontrado');
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    // Passar para a view
    res.render('usuarios/exibir-evento', {
      layout: false,
      title: evento.titulo,
      usuario: req.session.user,
      evento,
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

const exibirHome = async (req, res) => {
  try {
    // Buscar eventos recentes ou futuros
    const eventos = await eventoModel.buscarConteudosRecentes();

    // Renderizar a view 'home' com os eventos e o layout configurado
    res.render('home', {
      layout: 'layouts/default/index', // Usando o layout configurado
      title: 'Home - Redefinindo Jornadas',
      eventos, // Passa os eventos para a view
    });
  } catch (error) {
    console.error('Erro ao exibir a home:', error);
    res.status(500).send('Erro ao carregar a página inicial.');
  }
};

module.exports = {
  criarEvento, exibirEvento, curtirEvento, compartilharEvento, participarEvento, exibirHome,
};
