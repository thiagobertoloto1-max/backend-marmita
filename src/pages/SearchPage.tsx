// Search Page - Product and category search

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowLeft, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { searchProducts, categories, Product } from '@/data/products';
import { cn } from '@/lib/utils';

const popularSearches = [
  'Feijoada',
  'Strogonoff',
  'Fitness',
  'Low Carb',
  'Frango',
  'Vegetariano'
];

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    return searchProducts(query);
  }, [query]);

  const matchingCategories = useMemo(() => {
    if (query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(lowerQuery) ||
        cat.description.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const handleClear = () => {
    setQuery('');
  };

  const handlePopularSearch = (term: string) => {
    setQuery(term);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Link
            to="/"
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex-1 relative">
            <div className={cn(
              'search-bar',
              isFocused && 'ring-2 ring-primary/30'
            )}>
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Buscar marmitas, categorias..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="p-1 rounded-full hover:bg-border transition-colors"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="p-4">
        {/* No query - show popular searches */}
        {query.length < 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                Buscas populares
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handlePopularSearch(term)}
                    className="category-pill"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-4">Categorias</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium text-sm">{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Has query - show results */}
        {query.length >= 2 && (
          <div className="space-y-6">
            {/* Category matches */}
            {matchingCategories.length > 0 && (
              <div>
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Categorias
                </h2>
                <div className="flex flex-wrap gap-2">
                  {matchingCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.id}`}
                      className="category-pill"
                    >
                      {category.icon} {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Product results */}
            {results.length > 0 ? (
              <div>
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  {results.length} {results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </h2>
                <div className="space-y-3">
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} variant="horizontal" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-6xl mb-4">🔍</span>
                <h2 className="font-semibold text-lg">Nenhum resultado para "{query}"</h2>
                <p className="text-muted-foreground mt-1">
                  Tente buscar por outro termo
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
