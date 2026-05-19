import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './CategoryCard.css';

const CategoryCard = ({ category }) => {
  return (
    <Link to={`/products?category=${category.name.toLowerCase()}`}>
      <motion.div 
        className="category-card"
        whileHover={{ y: -5, scale: 1.02 }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
      >
        <div className="category-image-wrapper">
          <img src={category.image} alt={category.name} className="category-image" />
        </div>
        <div className="category-name-wrapper">
          <h3 className="category-name">{category.name}</h3>
        </div>
      </motion.div>
    </Link>
  );
};

export default CategoryCard;
