import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import Button from './Button';
import useCartStore from '../../store/cartStore';
import { API_BASE_URL } from '../../config';
import './ProductCard.css';
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  const API_URL = API_BASE_URL;

  const name = product.productName || product.name;
  const seller = product.sellerName || product.vendor;
  const image = product.productImage || product.image;
  const price = product.price;
  const rating = product.rating;
  const category = product.category;
  const id = product._id || product.id;
  const stock = product.stockQuantity || product.stock || 999;

  const imageUrl = image?.startsWith('http')
    ? image
    : `${API_URL}${image}`;

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (stock <= 0) {
      alert('Product is out of stock');
      return;
    }

    addToCart(product, 1);
    alert('Product added to cart');
  };

  return (
    <motion.div
      className="product-card"
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onClick={() => navigate(`/product/${id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-image-container">
        <img
          src={imageUrl}
          alt={name}
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/300x200?text=No+Image';
          }}
        />
      </div>

      <div className="product-content">
        <div className="product-meta">
          <span className="product-category">{category}</span>

          <div className="product-rating">
            <Star
              size={14}
              fill="var(--color-accent)"
              color="var(--color-accent)"
            />
            <span>{Number(rating || 0).toFixed(1)}</span>
          </div>
        </div>

        <h3 className="product-name">{name}</h3>

        <p className="product-vendor">by {seller}</p>

        <div className="product-footer">
          <div className="product-price">
            <span className="current-price">
              ₹{Number(price || 0).toFixed(2)}
            </span>
          </div>

          <Button
            size="sm"
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={stock <= 0}
          >
            <ShoppingCart size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;