const router        = require('express').Router();
const authJWT       = require('../middlewares/authJWT');
const authorizeRole = require('../middlewares/authorizeRole');
const ctrl          = require('../controllers/products.controller');

// Lectura — cualquier usuario autenticado (admin o client)
router.get('/',    authJWT,                             ctrl.getAll);
router.get('/:id', authJWT,                             ctrl.getOne);

// Escritura — solo admin
router.post('/',        authJWT, authorizeRole('admin'), ctrl.create);
router.put('/:id',      authJWT, authorizeRole('admin'), ctrl.update);
router.patch('/:id',    authJWT, authorizeRole('admin'), ctrl.update);
router.delete('/:id',   authJWT, authorizeRole('admin'), ctrl.remove);

module.exports = router;
