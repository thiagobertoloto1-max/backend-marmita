// Category Card Component

import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/data/products';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'compact' | 'pill';
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, variant = 'default' }) => {
  if (variant === 'pill') {
    return (
      <Link
        to={`/category/${category.id}`}
        className="category-pill whitespace-nowrap touch-feedback"
      >
        <span className="mr-1.5">{category.icon}</span>
        {category.name}
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/category/${category.id}`}
        className="flex flex-col items-center gap-2 touch-feedback group"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl group-hover:bg-primary/10 transition-colors">
          {category.icon}
        </div>
        <span className="text-xs font-medium text-center text-foreground">{category.name}</span>
      </Link>
    );
  }

  // Default variant - larger card with image
  return (
    <Link
      to={`/category/${category.id}`}
      className="relative rounded-xl overflow-hidden group touch-feedback"
      style={{ aspectRatio: '3/2' }}
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <h3 className="font-display font-bold text-lg text-white">{category.name}</h3>
        </div>
        <p className="text-sm text-white/80 mt-1 line-clamp-1">{category.description}</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
