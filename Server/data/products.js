const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getImagePath = (productName) => {
  return `/images/products/${slugify(productName)}.png`;
};

const rawProducts = [
  { productName: 'Frozen Green Peas', price: 95, sellerName: 'FrozenMart', category: 'Frozen Food', rating: 4.2, stockQuantity: 120, description: 'Frozen green peas' },
  { productName: 'Vanilla Ice Cream Tub', price: 220, sellerName: 'Ice Cream Hub', category: 'Frozen Food', rating: 4.6, stockQuantity: 50, description: 'Vanilla ice cream tub' },

  { productName: 'Tata Tea Gold 250 g', price: 160, sellerName: 'Tea House', category: 'Tea & Coffee', rating: 4.6, stockQuantity: 150, description: 'Premium tea leaves' },
  { productName: 'Red Label Tea 250 g', price: 145, sellerName: 'Tea House', category: 'Tea & Coffee', rating: 4.3, stockQuantity: 135, description: 'Strong tea blend' },
  { productName: 'Nescafe Classic Coffee', price: 320, sellerName: 'Coffee World', category: 'Tea & Coffee', rating: 4.7, stockQuantity: 90, description: 'Instant coffee jar' },
  { productName: 'Bru Instant Coffee', price: 285, sellerName: 'Coffee World', category: 'Tea & Coffee', rating: 4.4, stockQuantity: 95, description: 'Instant coffee powder' },
  { productName: 'Green Tea Bags', price: 180, sellerName: 'Tea House', category: 'Tea & Coffee', rating: 4.2, stockQuantity: 80, description: 'Green tea bags' },

  { productName: 'Dove Shampoo 340 ml', price: 340, sellerName: 'Beauty Store', category: 'Personal Care', rating: 4.5, stockQuantity: 100, description: 'Hair care shampoo' },
  { productName: 'Head & Shoulders Shampoo', price: 330, sellerName: 'Beauty Store', category: 'Personal Care', rating: 4.4, stockQuantity: 95, description: 'Anti-dandruff shampoo' },
  { productName: 'Nivea Face Wash', price: 199, sellerName: 'GlowCare', category: 'Personal Care', rating: 4.2, stockQuantity: 90, description: 'Refreshing face wash' },
  { productName: 'Colgate Toothpaste', price: 105, sellerName: 'Daily Care', category: 'Personal Care', rating: 4.5, stockQuantity: 200, description: 'Dental care toothpaste' },
  { productName: 'Closeup Toothpaste', price: 99, sellerName: 'Daily Care', category: 'Personal Care', rating: 4.2, stockQuantity: 190, description: 'Fresh breath toothpaste' },
  { productName: 'Dove Soap Pack', price: 165, sellerName: 'Beauty Store', category: 'Personal Care', rating: 4.6, stockQuantity: 150, description: 'Soft moisturizing soap' },
  { productName: 'Dettol Handwash', price: 99, sellerName: 'Daily Care', category: 'Personal Care', rating: 4.4, stockQuantity: 160, description: 'Antibacterial handwash' },

  { productName: 'Surf Excel Detergent 1 kg', price: 220, sellerName: 'Clean Home', category: 'Cleaning', rating: 4.5, stockQuantity: 120, description: 'Detergent powder' },
  { productName: 'Ariel Detergent 1 kg', price: 235, sellerName: 'Clean Home', category: 'Cleaning', rating: 4.4, stockQuantity: 110, description: 'Washing powder' },
  { productName: 'Harpic Toilet Cleaner', price: 99, sellerName: 'Clean Home', category: 'Cleaning', rating: 4.3, stockQuantity: 125, description: 'Toilet cleaning liquid' },
  { productName: 'Lizol Floor Cleaner', price: 180, sellerName: 'Clean Home', category: 'Cleaning', rating: 4.5, stockQuantity: 105, description: 'Floor disinfectant cleaner' },

  { productName: 'A4 Notebook', price: 80, sellerName: 'Office Mart', category: 'Stationery', rating: 4.2, stockQuantity: 150, description: 'A4 size notebook' },
];

const products = rawProducts.map((product) => ({
  ...product,
  productImage: getImagePath(product.productName),
}));

module.exports = products;