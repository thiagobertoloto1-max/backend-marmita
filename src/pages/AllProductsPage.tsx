// All Products Page - Shows all products from the catalog

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import StoreHeader from '@/components/StoreHeader';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';

const AllProductsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <StoreHeader />

      {/* Header with back button */}
      <div className="px-4 py-4 flex items-center gap-3">
        <Link 
          to="/" 
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display font-bold text-xl">Cardápio Completo 🍱</h1>
      </div>

      {/* All Products Grid */}
      <section className="pb-24 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant="horizontal" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AllProductsPage;
