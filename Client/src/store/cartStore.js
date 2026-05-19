import { create } from 'zustand';

const STORAGE_KEY = 'whiteocean-carts';
const GUEST_KEY = 'guest';

const getAllCarts = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const saveAllCarts = (carts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
};

const normalizeProduct = (product, quantity = 1) => {
  const id = product._id || product.id;

  return {
    _id: id,
    productName: product.productName || product.name,
    sellerName: product.sellerName || product.vendor || 'Unknown Seller',
    productImage: product.productImage || product.image,
    price: Number(product.price || 0),
    stockQuantity: Number(product.stockQuantity || product.stock || 999),
    category: product.category || '',
    quantity,
  };
};

const useCartStore = create((set, get) => ({
  cartItems: [],
  cartOwnerKey: GUEST_KEY,

  setCartOwner: (userId) => {
    const newKey = userId || GUEST_KEY;
    const oldKey = get().cartOwnerKey;

    const carts = getAllCarts();

    // Guest cart ko login user cart me merge karo
    if (oldKey === GUEST_KEY && newKey !== GUEST_KEY && carts[GUEST_KEY]?.length) {
      const guestItems = carts[GUEST_KEY] || [];
      const userItems = carts[newKey] || [];

      guestItems.forEach((guestItem) => {
        const existing = userItems.find((item) => item._id === guestItem._id);

        if (existing) {
          existing.quantity = Math.min(
            existing.quantity + guestItem.quantity,
            existing.stockQuantity
          );
        } else {
          userItems.push(guestItem);
        }
      });

      carts[newKey] = userItems;
      carts[GUEST_KEY] = [];
      saveAllCarts(carts);
    }

    set({
      cartOwnerKey: newKey,
      cartItems: carts[newKey] || [],
    });
  },

  saveCart: (items) => {
    const carts = getAllCarts();
    carts[get().cartOwnerKey] = items;
    saveAllCarts(carts);
    set({ cartItems: items });
  },

  addToCart: (product, quantity = 1) => {
    const items = [...get().cartItems];
    const cartProduct = normalizeProduct(product, quantity);

    if (!cartProduct._id) {
      alert('Invalid product');
      return;
    }

    const existingIndex = items.findIndex((item) => item._id === cartProduct._id);

    if (existingIndex !== -1) {
      const existingItem = items[existingIndex];
      const newQty = existingItem.quantity + quantity;

      if (newQty > existingItem.stockQuantity) {
        alert(`Only ${existingItem.stockQuantity} items available in stock`);
        return;
      }

      items[existingIndex] = {
        ...existingItem,
        quantity: newQty,
      };
    } else {
      if (quantity > cartProduct.stockQuantity) {
        alert(`Only ${cartProduct.stockQuantity} items available in stock`);
        return;
      }

      items.push(cartProduct);
    }

    get().saveCart(items);
  },

  increaseQuantity: (productId) => {
    const items = get().cartItems.map((item) => {
      if (item._id === productId) {
        if (item.quantity >= item.stockQuantity) {
          alert(`Only ${item.stockQuantity} items available in stock`);
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }

      return item;
    });

    get().saveCart(items);
  },

  decreaseQuantity: (productId) => {
    const items = get()
      .cartItems.map((item) => {
        if (item._id === productId) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }

        return item;
      })
      .filter((item) => item.quantity > 0);

    get().saveCart(items);
  },

  removeFromCart: (productId) => {
    const items = get().cartItems.filter((item) => item._id !== productId);
    get().saveCart(items);
  },

  clearCart: () => {
    get().saveCart([]);
  },

  getCartCount: () => {
    return get().cartItems.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },
}));

export default useCartStore;