// Layout Component - Main app layout with bottom navigation

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import CartSlideOver from './CartSlideOver';
import { useCart } from '@/contexts/CartContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const { isCartOpen, closeCart } = useCart();

  // Hide bottom nav on checkout and confirmation pages
  const hideBottomNav = ['/checkout', '/confirmation'].some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen bg-background">
      <main className={hideBottomNav ? '' : 'safe-bottom'}>
        <Outlet />
      </main>
      
      {!hideBottomNav && <BottomNavigation />}
      
      {/* Cart Slide Over */}
      <CartSlideOver isOpen={isCartOpen} onClose={closeCart} />
    </div>
  );
};

export default Layout;
