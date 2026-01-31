// Home Page - Main landing page with banner, categories, and products

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import StoreHeader from '@/components/StoreHeader';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import ReviewCard from '@/components/ReviewCard';
import AllReviewsModal from '@/components/AllReviewsModal';
import { Button } from '@/components/ui/button';
import { categories, getBestSellers, products } from '@/data/products';
import { getDisplayReviews, reviews as allReviews } from '@/data/reviews';
import { cn } from '@/lib/utils';

import promoLeve2Pague1 from '@/assets/banners/promo-leve2-pague1.webp';

const HomePage: React.FC = () => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const bestSellers = getBestSellers();
  const displayReviews = getDisplayReviews();

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <StoreHeader />

      {/* Banner Image */}
      <section className="px-4 pt-4">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={promoLeve2Pague1}
            alt="Promoção Leve 2, Pague 1"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* Promo Text Section */}
      <section className="px-4 py-4">
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-4 text-white shadow-lg">
          <h2 className="font-display font-bold text-xl md:text-2xl">
            🔥 LEVE 2, PAGUE 1!
          </h2>
          <p className="mt-2 text-sm md:text-base text-white/95">
            MEGA PROMOÇÃO! Leve 2 marmitas tamanho M e pague só R$25,90 (2 Coca-Cola 350ml inclusas)
          </p>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              ⏳ Oferta válida por tempo limitado
            </span>
            <span className="hidden sm:inline text-white/50">•</span>
            <span className="flex items-center gap-1">
              🚚 FRETE GRÁTIS NA SUA PRIMEIRA COMPRA!
            </span>
          </div>
          <button
            onClick={() => {
              document.getElementById('cardapio-completo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-4 bg-white text-red-600 font-bold px-6 py-2 rounded-full shadow-md hover:bg-white/90 transition-colors text-sm"
          >
            Peça agora
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-display font-bold text-lg">Categorias</h2>
          <Link
            to="/categories"
            className="text-sm text-primary font-medium flex items-center gap-1"
          >
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} variant="compact" />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-display font-bold text-lg">Mais Pedidos 🔥</h2>
          <Link
            to="/category/all?filter=bestsellers"
            className="text-sm text-primary font-medium flex items-center gap-1"
          >
            Ver mais
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide pb-2">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} variant="compact" />
          ))}
        </div>
      </section>

      {/* All Products */}
      <section id="cardapio-completo" className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-display font-bold text-lg">Cardápio Completo 🍱</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} variant="horizontal" />
          ))}
        </div>
        <div className="px-4 mt-4">
          <Link
            to="/all-products"
            className="block text-center text-primary font-semibold py-3 border border-primary rounded-xl hover:bg-primary/5 transition-colors"
          >
            Ver mais
          </Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-6 bg-muted/50">
        <div className="px-4 mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-lg">O que dizem nossos clientes ⭐</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <span className="text-sm font-medium">5.0</span>
              <span className="text-sm text-muted-foreground">({allReviews.length} avaliações)</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllReviews(true)}
            className="text-primary font-medium"
          >
            Ver mais
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide pb-2">
          {displayReviews.map((review) => (
            <ReviewCard key={review.id} review={review} compact />
          ))}
        </div>
      </section>

      <AllReviewsModal open={showAllReviews} onOpenChange={setShowAllReviews} />

      {/* About Section */}
      <section className="py-6 px-4">
        <h2 className="font-display font-bold text-lg mb-3">Sobre Nós</h2>
        <div className="bg-card p-4 rounded-xl shadow-sm">
          <p className="text-sm text-muted-foreground leading-relaxed">
            O <strong className="text-foreground">Divino Sabor</strong> nasceu da paixão por comida caseira de verdade. 
            Cada marmita é preparada com ingredientes frescos, tempero caseiro e muito carinho. 
            Nosso compromisso é entregar sabor, qualidade e a refeição perfeita para o seu dia a dia. 
            Peça agora e prove a diferença! 🍱❤️
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
