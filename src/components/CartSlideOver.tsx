// Cart Slide Over Component

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, Tag, Percent } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/services/paymentService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { isDiscountActive, getDiscountPercentage } from '@/lib/pricing';

interface CartSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlideOver: React.FC<CartSlideOverProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { 
    cart, 
    updateQuantity, 
    removeItem, 
    applyCoupon, 
    removeCoupon 
  } = useCart();
  const [couponInput, setCouponInput] = React.useState('');
  const [couponError, setCouponError] = React.useState('');

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    
    const result = applyCoupon(couponInput);
    if (result.success) {
      setCouponInput('');
      setCouponError('');
    } else {
      setCouponError(result.error || 'Cupom inválido');
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'slide-panel',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Voltar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-lg">Seu Carrinho</h2>
              <span className="text-sm text-muted-foreground">
                ({cart.items.length} {cart.items.length === 1 ? 'item' : 'itens'})
              </span>
            </div>
            <div className="w-9" /> {/* Spacer for alignment */}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg">Carrinho vazio</h3>
                <p className="text-muted-foreground mt-1">
                  Adicione deliciosas marmitas para continuar
                </p>
                <Button onClick={onClose} className="mt-6">
                  Ver Cardápio
                </Button>
              </div>
            ) : (
              cart.items.map(item => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-muted/50 rounded-xl"
                >
                  {/* Product Image */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tamanho: {item.size.name}
                      {item.addons.length > 0 && (
                        <> • +{item.addons.length} adicionais</>
                      )}
                    </p>

                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic mt-0.5 truncate">
                        "{item.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="qty-button"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-semibold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="qty-button"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="price-tag text-sm">
                          {formatCurrency(item.totalPrice)}
                        </span>
                        {isDiscountActive() && item.originalUnitPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatCurrency(item.originalUnitPrice * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Coupon and Totals */}
          {cart.items.length > 0 && (
            <div className="border-t border-border p-4 space-y-4 bg-card">
              {/* Coupon */}
              <div>
                {cart.couponCode ? (
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">
                        Cupom {cart.couponCode} aplicado
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-sm text-muted-foreground hover:text-destructive"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      placeholder="Código do cupom"
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={handleApplyCoupon}>
                      Aplicar
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-destructive mt-1">{couponError}</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span className="text-success font-medium">GRÁTIS</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Desconto</span>
                    <span>-{formatCurrency(cart.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(cart.total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                className="w-full font-semibold"
                onClick={handleCheckout}
              >
                Ir para Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSlideOver;
