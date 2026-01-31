// Cart Context - Global cart state management

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Cart, 
  CartItem, 
  CouponResult,
  loadCart, 
  addToCart as addToCartService, 
  updateItemQuantity as updateQuantityService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
  applyCoupon as applyCouponService,
  removeCoupon as removeCouponService,
  getCartItemCount 
} from '@/services/cartService';
import { Product, ProductSize, ProductAddon } from '@/data/products';

interface CartContextType {
  cart: Cart;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    product: Product,
    size: ProductSize,
    addons: ProductAddon[],
    quantity: number,
    notes?: string
  ) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => CouponResult;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => loadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);

  const itemCount = getCartItemCount(cart);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addItem = (
    product: Product,
    size: ProductSize,
    addons: ProductAddon[],
    quantity: number,
    notes: string = ''
  ) => {
    const newCart = addToCartService(cart, product, size, addons, quantity, notes);
    setCart(newCart);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const newCart = updateQuantityService(cart, itemId, quantity);
    setCart(newCart);
  };

  const removeItem = (itemId: string) => {
    const newCart = removeFromCartService(cart, itemId);
    setCart(newCart);
  };

  const clearCart = () => {
    const newCart = clearCartService();
    setCart(newCart);
  };

  const applyCoupon = (code: string): CouponResult => {
    const { cart: newCart, result } = applyCouponService(cart, code);
    setCart(newCart);
    return result;
  };

  const removeCoupon = () => {
    const newCart = removeCouponService(cart);
    setCart(newCart);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
