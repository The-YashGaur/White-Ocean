import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import Button from '../components/ui/Button';
import useProductStore from '../store/productStore';
import useCartStore from '../store/cartStore';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentProduct: product,
    isLoading,
    error,
    fetchProductById,
  } = useProductStore();

  const { addToCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');

  const API_URL = 'http://localhost:5000';

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://placehold.co/500x400?text=No+Image';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    return `${API_URL}${imagePath}`;
  };

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  useEffect(() => {
    if (product?.productImage) {
      setSelectedImage(getImageUrl(product.productImage));
    }
  }, [product?.productImage]);

  if (isLoading) {
    return (
      <div className="product-details-page py-12">
        <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: '4px solid #e2e8f0',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto',
            }}
          />

          <p style={{ marginTop: '1rem', color: 'var(--color-text-gray)' }}>
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page py-12">
        <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>
            ⚠️ {error || 'Product not found.'}
          </p>

          <Button onClick={() => navigate('/products')}>
            ← Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const name = product.productName;
  const mainImage = getImageUrl(product.productImage);
  const seller = product.sellerName;
  const price = product.price;
  const rating = product.rating;
  const category = product.category;
  const description = product.description;
  const stock = Number(product.stockQuantity || 0);

  const galleryImages = product.images?.length
    ? product.images.map((img) => getImageUrl(img))
    : [mainImage];

  const handleIncreaseQuantity = () => {
    if (quantity >= stock) {
      alert(`Only ${stock} items available in stock`);
      return;
    }

    setQuantity((q) => q + 1);
  };

  const handleAddToCart = () => {
    if (stock <= 0) {
      alert('Product is out of stock');
      return;
    }

    addToCart(product, quantity);
    alert('Product added to cart');
  };

  return (
    <div className="product-details-page py-12">
      <div className="container">
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-text-gray)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="details-layout">
          <div className="product-gallery">
            <div className="main-image-wrapper">
              <img
                src={selectedImage || mainImage}
                alt={name}
                className="main-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://placehold.co/500x400?text=No+Image';
                }}
              />
            </div>

            <div className="thumbnail-list">
              {galleryImages.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${
                    (selectedImage || mainImage) === img ? 'active' : ''
                  }`}
                  onClick={() => setSelectedImage(img)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={img}
                    alt={`${name} thumb ${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        'https://placehold.co/100x100?text=Img';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="product-info-section">
            <div className="breadcrumb">
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                Home
              </span>{' '}
              /
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/products')}>
                {' '}Shop
              </span>{' '}
              /
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/products?category=${category}`)}
              >
                {' '}{category}
              </span>{' '}
              /
              <span className="current"> {name}</span>
            </div>

            <h1 className="product-title">{name}</h1>

            <div className="meta-row">
              <div className="rating-box">
                <Star
                  size={16}
                  fill="var(--color-accent)"
                  color="var(--color-accent)"
                />

                <span>{Number(rating || 0).toFixed(1)}</span>
                <span className="reviews-count">(reviews)</span>
              </div>

              <span className={`stock-status ${stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
              </span>
            </div>

            <p className="vendor-link">
              Sold by: <strong>{seller}</strong>
            </p>

            <div className="price-box">
              <span className="price-current">
                ₹{Number(price || 0).toFixed(2)}
              </span>
            </div>

            {description && <p className="product-desc">{description}</p>}

            <hr className="divider" />

            <div className="actions-row">
              <div className="quantity-selector">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="qty-btn"
                  disabled={stock <= 0}
                >
                  <Minus size={16} />
                </button>

                <span className="qty-value">{quantity}</span>

                <button
                  onClick={handleIncreaseQuantity}
                  className="qty-btn"
                  disabled={stock <= 0}
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                size="lg"
                className="add-to-cart-primary"
                disabled={stock <= 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={20} /> Add to Cart
              </Button>

              <button className="wishlist-btn">
                <Heart size={24} color="var(--color-text-gray)" />
              </button>
            </div>

            <div className="features-box">
              <div className="feature-item">
                <Truck size={24} className="text-primary" />
                <div>
                  <h4>Free Delivery</h4>
                  <p>On orders over ₹500</p>
                </div>
              </div>

              <div className="feature-item">
                <ShieldCheck size={24} className="text-primary" />
                <div>
                  <h4>Quality Guarantee</h4>
                  <p>100% fresh or refund</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;