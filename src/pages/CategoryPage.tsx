// Category Page - Product listing by category with filters

import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Star, Clock, TrendingUp, X } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import ProductCard from '@/components/ProductCard';
import { getCategoryById, getProductsByCategory, products, categories, Category } from '@/data/products';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'fastest';

const sortOptions = [
  { value: 'default', label: 'Relevância', icon: TrendingUp },
  { value: 'price-asc', label: 'Menor Preço', icon: null },
  { value: 'price-desc', label: 'Maior Preço', icon: null },
  { value: 'rating', label: 'Melhor Avaliação', icon: Star },
  { value: 'fastest', label: 'Mais Rápido', icon: Clock }
];

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [selectedSort, setSelectedSort] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  
  const categoryProducts = useMemo(() => {
    let items = categoryId === 'all' ? products : getProductsByCategory(categoryId || '');
    
    switch (selectedSort) {
      case 'price-asc':
        return [...items].sort((a, b) => {
          const priceA = a.isPromo && a.promoPrice ? a.promoPrice : a.basePrice;
          const priceB = b.isPromo && b.promoPrice ? b.promoPrice : b.basePrice;
          return priceA - priceB;
        });
      case 'price-desc':
        return [...items].sort((a, b) => {
          const priceA = a.isPromo && a.promoPrice ? a.promoPrice : a.basePrice;
          const priceB = b.isPromo && b.promoPrice ? b.promoPrice : b.basePrice;
          return priceB - priceA;
        });
      case 'rating':
        return [...items].sort((a, b) => b.rating - a.rating);
      case 'fastest':
        return [...items].sort((a, b) => a.prepTime - b.prepTime);
      default:
        return items;
    }
  }, [categoryId, selectedSort]);

  const title = category?.name || (categoryId === 'all' ? 'Todas as Marmitas' : 'Categoria');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link
            to="/"
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg flex items-center gap-2">
              {category?.icon} {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {categoryProducts.length} {categoryProducts.length === 1 ? 'produto' : 'produtos'}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-2 rounded-full transition-colors',
              showFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
            aria-label="Filtros"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Sort/Filter Options */}
        {showFilters && (
          <div className="px-4 pb-4 animate-slide-down">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedSort(option.value as SortOption)}
                  className={cn(
                    'category-pill whitespace-nowrap flex items-center gap-1.5',
                    selectedSort === option.value && 'active'
                  )}
                >
                  {option.icon && <option.icon className="w-4 h-4" />}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Pills (when viewing all) */}
        {categoryId === 'all' && (
          <div className="px-4 pb-3 border-t border-border pt-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <Link
                to="/category/all"
                className={cn('category-pill whitespace-nowrap active')}
              >
                Todos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="category-pill whitespace-nowrap"
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Product Grid */}
      <main className="p-4">
        {categoryProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-6xl mb-4">🍽️</span>
            <h2 className="font-semibold text-lg">Nenhum produto encontrado</h2>
            <p className="text-muted-foreground mt-1">
              Tente outra categoria ou volte para a página inicial
            </p>
            <Button asChild className="mt-6">
              <Link to="/">Ver Cardápio</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
