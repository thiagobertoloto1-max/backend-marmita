// Product Card Component

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Plus, Percent } from 'lucide-react';
import { Product } from '@/data/products';
import { formatCurrency } from '@/services/paymentService';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { getDiscountedPrice, isDiscountActive } from '@/lib/pricing';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'default' }) => {
  const { addItem, openCart } = useCart();
  const { toast } = useToast();
  const originalPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.basePrice;
  const displayPrice = isDiscountActive() ? getDiscountedPrice(originalPrice) : originalPrice;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultSize = product.sizes?.[0];
    if (!defaultSize) return;

    addItem(product, defaultSize, [], 1, '');
    toast({
      title: 'Adicionado ao carrinho!',
      description: `1x ${product.name} (${defaultSize.name})`,
      duration: 2000,
    });
    openCart();
  };

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/product/${product.id}`}
        className="product-card flex gap-3 p-3 touch-feedback"
      >
        {/* Image */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {product.isPromo && (
            <span className="absolute top-1 left-1 px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
              PROMO
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {product.shortDescription}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{product.prepTime} min</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {product.fromPrice && (
                <span className="text-xs text-muted-foreground">a partir de</span>
              )}
              <span className="price-tag text-lg">{formatCurrency(displayPrice)}</span>
              {isDiscountActive() && (
                <span className="price-original">{formatCurrency(originalPrice)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/product/${product.id}`}
        className="product-card w-40 shrink-0 touch-feedback"
      >
        {/* Image */}
        <div className="relative aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {product.isPromo && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
              PROMO
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
          <div className="flex flex-col mt-1">
            {product.fromPrice && (
              <span className="text-[10px] text-muted-foreground">a partir de</span>
            )}
            <div className="flex items-center gap-1">
              <p className="price-tag text-base">{formatCurrency(displayPrice)}</p>
              {isDiscountActive() && (
                <span className="text-xs text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card touch-feedback"
    >
      {/* Image */}
      <div className="relative aspect-[4/3]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {product.isPromo && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
            PROMO
          </span>
        )}
        {product.isBestSeller && !product.isPromo && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">
            MAIS PEDIDO
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.shortDescription}
            </p>
          </div>
          <button
            className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            onClick={handleQuickAdd}
            aria-label="Adicionar ao carrinho"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{product.prepTime} min</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {product.fromPrice && (
            <span className="text-xs text-muted-foreground">a partir de</span>
          )}
          <span className="price-tag text-lg">{formatCurrency(displayPrice)}</span>
          {isDiscountActive() && (
            <span className="price-original">{formatCurrency(originalPrice)}</span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {product.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
