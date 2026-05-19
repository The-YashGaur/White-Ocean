const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getCategories } = require('../controllers/productController');

// GET /api/products/categories  — must come before /:id
router.get('/categories', getCategories);

// GET /api/products
router.get('/', getProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

module.exports = router;
