const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const login = async (req, res ) => {

    const {email, senha } = req.body;

    try {

    } catch (error) {
        console.error('Erro no login: ' + error);
        res.status(500).json({ erro : 'Erro interno no servidor.' })
    }
};

module.exports = { login }