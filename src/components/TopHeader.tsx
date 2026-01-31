// Top Header Component - Logo, search, and cart

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import logoDivinoSabor from '@/assets/logo-divino-sabor.png';

interface TopHeaderProps {
  showSearch?: boolean;
  transparent?: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({ showSearch = true, transparent = false }) => {
  const navigate = useNavigate();
  const { itemCount, openCart } = useCart();

  return (
    <header 
      className={cn(
        'sticky top-0 z-40 transition-colors duration-200',
        transparent ? 'bg-transparent' : 'bg-card border-b border-border'
      )}
    >
      <div className="container px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img 
              src={logoDivinoSabor} 
              alt="Divino Sabor" 
              className="w-10 h-10 rounded-xl object-cover shadow-sm"
            />
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg text-foreground leading-tight">
                Divino Sabor
              </h1>
              <p className="text-xs text-muted-foreground">Marmitex caseiro de verdade</p>
            </div>
          </Link>

          {/* Search Bar */}
          {showSearch && (
            <button
              onClick={() => navigate('/search')}
              className="search-bar flex-1 max-w-md cursor-pointer"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">Buscar marmitas...</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors touch-feedback"
            aria-label={`Carrinho com ${itemCount} itens`}
          >
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="cart-badge">{itemCount > 9 ? '9+' : itemCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
