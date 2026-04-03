const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST em /login, chama func login do controller
router.post('/login', authController.login);

module.exports = router;