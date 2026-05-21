const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');

// POST /auth/signup  — registro público
router.post('/signup', ctrl.signup);

// POST /auth/login   — login → retorna JWT
router.post('/login', ctrl.login);

module.exports = router;
