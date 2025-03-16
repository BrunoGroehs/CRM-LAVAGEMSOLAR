/* 
  //historicoRoutes.js
*/
const express = require('express');
const router = express.Router();
const historicoController = require('../Controllers/historicoController');

// POST /historico
router.post('/', historicoController.addHistorico);

// GET /historico/:cliente_id
router.get('/:cliente_id', historicoController.getHistoricoByClient);

// DELETE /historico/:id
router.delete('/:id', historicoController.deleteHistorico);

module.exports = router;
