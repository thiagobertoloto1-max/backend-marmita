// Review Card Component

import React from 'react';
import { Star } from 'lucide-react';
import { Review } from '@/data/reviews';

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, compact = false }) => {
  return (
    <div
      className={`bg-card p-4 rounded-xl shadow-sm ${
        compact ? 'min-w-[280px] shrink-0' : 'w-full'
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-sm">{review.name}</p>
          <div className="flex gap-0.5">
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-accent text-accent" />
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
        "{review.text}"
      </p>
    </div>
  );
};

export default ReviewCard;
