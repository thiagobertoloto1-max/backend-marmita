// Product Page - Product details with option group selection

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Minus, Plus, ShoppingBag, Heart, Share2, ChevronLeft, ChevronRight, Check, Percent } from 'lucide-react';
import { getProductById, getCategoryById, ProductOptionGroup, ProductChoice, ProductSize, ProductAddon } from '@/data/products';
import { formatCurrency } from '@/services/paymentService';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getDiscountedPrice, isDiscountActive, getDiscountPercentage } from '@/lib/pricing';

interface SelectedOptions {
  [groupId: string]: ProductChoice[];
}

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { toast } = useToast();

  const product = productId ? getProductById(productId) : undefined;
  const category = product ? getCategoryById(product.categoryId) : undefined;

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Set default size when product loads
  React.useEffect(() => {
    if (product && product.sizes.length > 0 && !selectedSizeId) {
      setSelectedSizeId(product.sizes[0].id);
    }
  }, [product, selectedSizeId]);

  // Get selected size object
  const selectedSize = useMemo(() => {
    if (!product) return null;
    return product.sizes.find(s => s.id === selectedSizeId) || product.sizes[0];
  }, [product, selectedSizeId]);

  // Check if product has multiple sizes
  const hasMultipleSizes = product && product.sizes.length > 1 && product.sizes[0].id !== 'unico';

  // Calculate total price based on base price + size + selected option deltas with discount
  const { basePrice, totalPrice, originalTotal } = useMemo(() => {
    if (!product || !selectedSize) {
      return { basePrice: 0, totalPrice: 0, originalTotal: 0 };
    }
    const base = product.isPromo && product.promoPrice ? product.promoPrice : product.basePrice;
    const sizePrice = selectedSize.price;
    
    let optionsDelta = 0;
    Object.values(selectedOptions).forEach(choices => {
      choices.forEach(choice => {
        optionsDelta += choice.price;
      });
    });

    const originalUnit = base + sizePrice + optionsDelta;
    const originalTotal = originalUnit * quantity;
    
    // Apply site-wide discount
    const discountedUnit = isDiscountActive() ? getDiscountedPrice(originalUnit) : originalUnit;
    const discountedTotal = discountedUnit * quantity;
    
    return {
      basePrice: isDiscountActive() ? getDiscountedPrice(base + sizePrice) : base + sizePrice,
      totalPrice: discountedTotal,
      originalTotal
    };
  }, [product, selectedSize, selectedOptions, quantity]);

  // Check if all required options are selected
  const requiredGroupsValid = useMemo(() => {
    if (!product) return false;
    return product.optionGroups
      .filter(g => g.required)
      .every(group => {
        const selected = selectedOptions[group.id] || [];
        return selected.length >= group.min && selected.length <= group.max;
      });
  }, [product, selectedOptions]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <span className="text-6xl mb-4">😕</span>
        <h1 className="font-display font-bold text-xl">Produto não encontrado</h1>
        <p className="text-muted-foreground mt-1">O produto que você procura não existe</p>
        <Button asChild className="mt-6">
          <Link to="/">Voltar ao Cardápio</Link>
        </Button>
      </div>
    );
  }

  const handleOptionToggle = (group: ProductOptionGroup, choice: ProductChoice) => {
    setSelectedOptions(prev => {
      const currentChoices = prev[group.id] || [];
      const isSelected = currentChoices.some(c => c.id === choice.id);

      if (group.type === 'single') {
        // Single selection - replace current
        return {
          ...prev,
          [group.id]: isSelected ? [] : [choice]
        };
      } else {
        // Multi selection
        if (isSelected) {
          return {
            ...prev,
            [group.id]: currentChoices.filter(c => c.id !== choice.id)
          };
        } else if (currentChoices.length < group.max) {
          return {
            ...prev,
            [group.id]: [...currentChoices, choice]
          };
        }
        return prev;
      }
    });
  };

  const handleAddToCart = () => {
    if (!requiredGroupsValid) {
      toast({
        title: 'Complete as opções obrigatórias',
        description: 'Selecione todas as opções necessárias para continuar',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedSize) {
      toast({
        title: 'Selecione um tamanho',
        description: 'Escolha o tamanho da marmita para continuar',
        variant: 'destructive'
      });
      return;
    }

    // Convert selected options to addons format
    const allSelectedChoices = Object.values(selectedOptions).flat();
    const mockAddons: ProductAddon[] = allSelectedChoices.map(choice => ({
      id: choice.id,
      name: choice.label,
      price: choice.price
    }));

    addItem(product, selectedSize, mockAddons, quantity, notes);
    
    toast({
      title: 'Adicionado ao carrinho! 🎉',
      description: `${quantity}x ${product.name} (${selectedSize.name})`,
      duration: 2000,
    });

    openCart();
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length);

  return (
    <div className="min-h-screen bg-background pb-44">
      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={product.images[currentImage]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navigation Arrows */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-lg"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-lg"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
              aria-label="Favoritar"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
              aria-label="Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentImage ? 'bg-white w-6' : 'bg-white/50'
                )}
                aria-label={`Ver imagem ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-16 flex gap-2">
          {product.isPromo && (
            <span className="px-3 py-1 bg-destructive text-destructive-foreground text-sm font-bold rounded-full shadow-lg">
              PROMO
            </span>
          )}
          {product.isBestSeller && !product.isPromo && (
            <span className="px-3 py-1 bg-accent text-accent-foreground text-sm font-bold rounded-full shadow-lg">
              MAIS PEDIDO
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <Link
            to={`/category/${product.categoryId}`}
            className="text-sm text-primary font-medium"
          >
            {category?.icon} {category?.name}
          </Link>
          <h1 className="font-display font-bold text-2xl mt-1">{product.name}</h1>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-accent text-accent" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviewCount} avaliações)</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span>{product.prepTime} min</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3">
            {product.fromPrice && (
              <span className="text-sm text-muted-foreground">a partir de</span>
            )}
            <span className="price-tag text-2xl">{formatCurrency(basePrice)}</span>
            {isDiscountActive() && (
              <>
                <span className="price-original text-lg">{formatCurrency(product.basePrice)}</span>
                <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
                  -{getDiscountPercentage()}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Descrição</h2>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>

        {/* Size Selection */}
        {hasMultipleSizes && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-lg">Escolha o Tamanho</h2>
                <p className="text-sm text-destructive font-medium">Escolha obrigatória</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {product.sizes.map((size) => {
                const isSelected = selectedSizeId === size.id;
                const sizeTotal = product.basePrice + size.price;
                const discountedSizeTotal = isDiscountActive() ? getDiscountedPrice(sizeTotal) : sizeTotal;
                
                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSizeId(size.id)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-3',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className={cn(
                      'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{size.name}</span>
                      {size.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{size.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 font-semibold text-primary">
                      {formatCurrency(discountedSizeTotal)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Option Groups */}
        {product.optionGroups.map((group) => {
          const selectedChoices = selectedOptions[group.id] || [];
          const selectionCount = selectedChoices.length;
          
          return (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-lg">{group.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {group.required ? (
                      <span className="text-destructive font-medium">Obrigatório</span>
                    ) : (
                      <span>Opcional</span>
                    )}
                    {group.max > 1 && (
                      <span> • Escolha {group.min === group.max ? group.min : `${group.min} a ${group.max}`}</span>
                    )}
                    {selectionCount > 0 && (
                      <span className="ml-2 text-primary font-medium">({selectionCount} selecionado{selectionCount > 1 ? 's' : ''})</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {group.choices.map((choice) => {
                  const isSelected = selectedChoices.some(c => c.id === choice.id);
                  const canSelect = isSelected || selectionCount < group.max;
                  
                  return (
                    <button
                      key={choice.id}
                      onClick={() => canSelect && handleOptionToggle(group, choice)}
                      disabled={!canSelect && !isSelected}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-3',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : canSelect
                            ? 'border-border hover:border-primary/50'
                            : 'border-border opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className={cn(
                        'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{choice.label}</span>
                        {choice.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{choice.description}</p>
                        )}
                      </div>
                      <span className={cn(
                        'shrink-0 font-semibold',
                        choice.price > 0 ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {choice.price === 0 ? 'Incluso' : choice.price > 0 ? `+${formatCurrency(choice.price)}` : formatCurrency(choice.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Notes */}
        <div>
          <h2 className="font-semibold text-lg mb-3">Observações</h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Sem cebola, bem assada..."
            className="resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Fixed Bottom Bar (kept above bottom navigation) */}
      <div
        className="fixed left-0 right-0 bg-card border-t border-border p-4 z-40"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 4rem)' }}
      >
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          {/* Quantity */}
          <div className="flex items-center gap-3 bg-muted rounded-full px-2 py-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="qty-button"
              disabled={quantity <= 1}
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-lg">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="qty-button"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="flex-1 font-semibold gap-2"
            onClick={handleAddToCart}
            disabled={!requiredGroupsValid}
          >
            <ShoppingBag className="w-5 h-5" />
            Adicionar {formatCurrency(totalPrice)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;