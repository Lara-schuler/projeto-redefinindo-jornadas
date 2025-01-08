const express = require('express');

const router = express.Router();
const eventoModel = require('../models/eventoModel'); // Certifique-se de que o caminho está correto

// Rota da home (página inicial)
router.get('/', async (req, res) => {
  try {
    // Buscar eventos recentes ou futuros
    const eventos = await eventoModel.buscarConteudosRecentes();

    res.render('home', {
      layout: 'layouts/default/index', // Usando o layout configurado
      title: 'Redefinindo Jornadas',
      eventos, // Passa os eventos para a view
    });
  } catch (error) {
    console.error('Erro ao buscar eventos para a home:', error);
    res.status(500).send('Erro ao carregar a página inicial');
  }
});

module.exports = router;
