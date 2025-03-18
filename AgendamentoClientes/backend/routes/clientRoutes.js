/* 
  //clientRoutes.js
*/
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// GET /clientes
router.get('/', clientController.getAllClients);

// POST /clientes
router.post('/', clientController.createClient);

// Adicionar rota PUT para atualizar informações do cliente
router.put('/:id', clientController.updateClient);

module.exports = router;
