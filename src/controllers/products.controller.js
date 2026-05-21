const pool = require('../config/db');

/**
 * GET /products
 * Retorna todos los productos activos.
 */
exports.getAll = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /products/:id
 * Retorna un producto por su UUID. 404 si no existe.
 */
exports.getOne = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE id = $1', [req.params.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /products  [admin]
 * Crea un nuevo producto. Valida name y price.
 */
exports.create = async (req, res, next) => {
  try {
    const { name, price, description, stock } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El campo name es requerido' });
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ error: 'price debe ser un número mayor que 0' });
    }

    const { rows } = await pool.query(
      `INSERT INTO products (name, price, description, stock, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name.trim(),
        Number(price),
        description || null,
        stock ?? 0,
        userId
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /products/:id  o  PATCH /products/:id  [admin]
 * Actualiza uno o más campos del producto. COALESCE mantiene los valores anteriores.
 */
exports.update = async (req, res, next) => {
  try {
    const { name, price, description, stock, is_active } = req.body;

    if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
      return res.status(400).json({ error: 'price debe ser un número mayor que 0' });
    }

    const { rows } = await pool.query(
      `UPDATE products SET
         name        = COALESCE($1, name),
         price       = COALESCE($2, price),
         description = COALESCE($3, description),
         stock       = COALESCE($4, stock),
         is_active   = COALESCE($5, is_active)
       WHERE id = $6
       RETURNING *`,
      [
        name   !== undefined ? name.trim()      : null,
        price  !== undefined ? Number(price)    : null,
        description !== undefined ? description : null,
        stock  !== undefined ? Number(stock)    : null,
        is_active !== undefined ? is_active     : null,
        req.params.id,
      ]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /products/:id  [admin]
 * Elimina un producto permanentemente. Retorna 204 sin contenido.
 */
exports.remove = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM products WHERE id = $1', [req.params.id]
    );
    if (!rowCount) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
