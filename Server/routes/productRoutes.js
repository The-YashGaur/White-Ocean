const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getCategories, getPublicSettings, getAnnouncements, getPublicVendors } = require('../controllers/productController');

// GET /api/products/settings
router.get('/settings', getPublicSettings);

// GET /api/products/announcements
router.get('/announcements', getAnnouncements);

// GET /api/products/vendors
router.get('/vendors', getPublicVendors);

// GET /api/products/categories  — must come before /:id
router.get('/categories', getCategories);

// GET /api/products
router.get('/', getProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

module.exports = router;
