// Cart Service - Persistent cart management with localStorage

import { Product, ProductSize, ProductAddon } from '@/data/products';
import { getDiscountedPrice, isDiscountActive } from '@/lib/pricing';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  size: ProductSize;
  addons: ProductAddon[];
  quantity: number;
  notes: string;
  unitPrice: number;
  totalPrice: number;
  originalUnitPrice?: number; // Original price before discount
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
}

const CART_STORAGE_KEY = 'divino_sabor_cart';
const DELIVERY_FEE = 0;

// Calculate item price with site-wide discount applied
const calculateItemPrice = (
  product: Product,
  size: ProductSize,
  addons: ProductAddon[],
  quantity: number
): { unitPrice: number; totalPrice: number; originalUnitPrice: number } => {
  const basePrice = product.isPromo && product.promoPrice ? product.promoPrice : product.basePrice;
  const sizePrice = size.price;
  const addonsPrice = addons.reduce((sum, addon) => sum + addon.price, 0);
  const originalUnitPrice = basePrice + sizePrice + addonsPrice;
  
  // Apply site-wide discount
  const unitPrice = isDiscountActive() ? getDiscountedPrice(originalUnitPrice) : originalUnitPrice;
  const totalPrice = unitPrice * quantity;
  
  return { unitPrice, totalPrice, originalUnitPrice };
};

// Generate unique cart item ID
const generateCartItemId = (
  productId: string,
  sizeId: string,
  addonIds: string[],
  notes: string
): string => {
  return `${productId}-${sizeId}-${addonIds.sort().join(',')}-${notes}`.replace(/\s/g, '');
};

// Load cart from localStorage
export const loadCart = (): Cart => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const cart = JSON.parse(stored) as Cart;
      return recalculateCart(cart);
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
  return createEmptyCart();
};

// Save cart to localStorage
export const saveCart = (cart: Cart): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

// Create empty cart
export const createEmptyCart = (): Cart => ({
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  discount: 0,
  total: 0
});

// Recalculate cart totals
export const recalculateCart = (cart: Cart): Cart => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = 0; // Free delivery
  const discount = cart.discount || 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  return {
    ...cart,
    subtotal,
    deliveryFee,
    total
  };
};

// Add item to cart
export const addToCart = (
  cart: Cart,
  product: Product,
  size: ProductSize,
  addons: ProductAddon[],
  quantity: number,
  notes: string = ''
): Cart => {
  const cartItemId = generateCartItemId(
    product.id,
    size.id,
    addons.map(a => a.id),
    notes
  );

  const existingItemIndex = cart.items.findIndex(item => item.id === cartItemId);
  const { unitPrice, totalPrice, originalUnitPrice } = calculateItemPrice(product, size, addons, quantity);

  let newItems: CartItem[];

  if (existingItemIndex >= 0) {
    // Update existing item
    newItems = cart.items.map((item, index) => {
      if (index === existingItemIndex) {
        const newQuantity = item.quantity + quantity;
        const { totalPrice: newTotalPrice } = calculateItemPrice(
          product,
          size,
          addons,
          newQuantity
        );
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newTotalPrice
        };
      }
      return item;
    });
  } else {
    // Add new item
    const newItem: CartItem = {
      id: cartItemId,
      productId: product.id,
      product,
      size,
      addons,
      quantity,
      notes,
      unitPrice,
      totalPrice,
      originalUnitPrice
    };
    newItems = [...cart.items, newItem];
  }

  const newCart = recalculateCart({ ...cart, items: newItems });
  saveCart(newCart);
  return newCart;
};

// Update item quantity
export const updateItemQuantity = (
  cart: Cart,
  itemId: string,
  quantity: number
): Cart => {
  if (quantity <= 0) {
    return removeFromCart(cart, itemId);
  }

  const newItems = cart.items.map(item => {
    if (item.id === itemId) {
      const { totalPrice } = calculateItemPrice(
        item.product,
        item.size,
        item.addons,
        quantity
      );
      return {
        ...item,
        quantity,
        totalPrice
      };
    }
    return item;
  });

  const newCart = recalculateCart({ ...cart, items: newItems });
  saveCart(newCart);
  return newCart;
};

// Remove item from cart
export const removeFromCart = (cart: Cart, itemId: string): Cart => {
  const newItems = cart.items.filter(item => item.id !== itemId);
  const newCart = recalculateCart({ ...cart, items: newItems });
  saveCart(newCart);
  return newCart;
};

// Clear cart
export const clearCart = (): Cart => {
  const emptyCart = createEmptyCart();
  saveCart(emptyCart);
  return emptyCart;
};

// Coupon validation result
export interface CouponResult {
  success: boolean;
  error?: string;
}

// Apply coupon
export const applyCoupon = (cart: Cart, couponCode: string): { cart: Cart; result: CouponResult } => {
  const code = couponCode.toUpperCase();
  
  // Special validation for PRIMEIRACOMPRA - requires subtotal > 49.90
  if (code === 'PRIMEIRACOMPRA') {
    if (cart.subtotal <= 49.90) {
      return {
        cart,
        result: {
          success: false,
          error: 'O cupom PRIMEIRACOMPRA é válido apenas para compras acima de R$49,90'
        }
      };
    }
  }
  
  // Mock coupon logic
  const coupons: Record<string, number> = {
    'PRIMEIRACOMPRA': 10,
    'DIVINO10': 10,
    'SABOR20': 20,
    'FRETE': cart.deliveryFee
  };

  const discount = coupons[code] || 0;
  
  if (discount === 0) {
    return {
      cart,
      result: {
        success: false,
        error: 'Cupom inválido'
      }
    };
  }
  
  const newCart = recalculateCart({
    ...cart,
    discount,
    couponCode: code
  });
  
  saveCart(newCart);
  return {
    cart: newCart,
    result: { success: true }
  };
};

// Remove coupon
export const removeCoupon = (cart: Cart): Cart => {
  const newCart = recalculateCart({
    ...cart,
    discount: 0,
    couponCode: undefined
  });
  saveCart(newCart);
  return newCart;
};

// Get cart item count
export const getCartItemCount = (cart: Cart): number => {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
};
