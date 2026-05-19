export const categories = [
  { id: 1, name: 'Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80' },
  { id: 2, name: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=300&q=80' },
  { id: 3, name: 'Dairy', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=300&q=80' },
  { id: 4, name: 'Seafood', image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=300&q=80' },
  { id: 5, name: 'Snacks', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=300&q=80' },
  { id: 6, name: 'Beverages', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=300&q=80' }
];

export const products = [
  {
    id: 1,
    name: 'Organic Bananas',
    price: 4.99,
    discount: 10,
    rating: 4.8,
    vendor: 'Fresh Farms',
    image: 'https://images.unsplash.com/photo-1571501443621-e0166a41f861?auto=format&fit=crop&w=400&q=80',
    category: 'Fruits',
    description: 'Fresh organic bananas directly from the farm.'
  },
  {
    id: 2,
    name: 'Fresh Avocados',
    price: 6.50,
    discount: 0,
    rating: 4.9,
    vendor: 'Green Valley',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80',
    category: 'Vegetables',
    description: 'Perfectly ripe avocados, great for guacamole.'
  },
  {
    id: 3,
    name: 'Whole Milk 1L',
    price: 2.99,
    discount: 5,
    rating: 4.5,
    vendor: 'Dairy Best',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80',
    category: 'Dairy',
    description: 'Farm fresh whole milk.'
  },
  {
    id: 4,
    name: 'Atlantic Salmon',
    price: 15.99,
    discount: 15,
    rating: 4.7,
    vendor: 'Ocean Catch',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
    category: 'Seafood',
    description: 'Premium wild-caught Atlantic salmon.'
  },
  {
    id: 5,
    name: 'Organic Spinach',
    price: 3.50,
    discount: 0,
    rating: 4.6,
    vendor: 'Green Valley',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
    category: 'Vegetables',
    description: 'Crisp organic spinach leaves.'
  },
  {
    id: 6,
    name: 'Orange Juice',
    price: 5.49,
    discount: 0,
    rating: 4.4,
    vendor: 'Sunshine Bev',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    category: 'Beverages',
    description: '100% pure squeezed orange juice.'
  }
];

export const vendors = [
  { id: 1, name: 'Fresh Farms', rating: 4.8, orders: 1240, image: 'https://images.unsplash.com/photo-1595853035070-59a39fe84dd3?auto=format&fit=crop&w=200&q=80' },
  { id: 2, name: 'Green Valley', rating: 4.9, orders: 3450, image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=200&q=80' },
  { id: 3, name: 'Ocean Catch', rating: 4.7, orders: 890, image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=200&q=80' }
];

export const recentOrders = [
  { id: '#ORD-001', customer: 'John Doe', total: 45.99, status: 'Delivered', date: '2026-05-10' },
  { id: '#ORD-002', customer: 'Jane Smith', total: 12.50, status: 'Processing', date: '2026-05-10' },
  { id: '#ORD-003', customer: 'Mike Johnson', total: 89.00, status: 'Shipped', date: '2026-05-09' },
  { id: '#ORD-004', customer: 'Sarah Williams', total: 24.99, status: 'Delivered', date: '2026-05-08' }
];
