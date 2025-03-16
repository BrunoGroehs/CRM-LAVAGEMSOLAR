/* 
  //clientRoutes.js
*/
const express = require('express');
const router = express.Router();
const clientController = require('../Controllers/clientController');

// GET /clientes
router.get('/', clientController.getAllClients);

// POST /clientes
router.post('/', clientController.createClient);

module.exports = router;
