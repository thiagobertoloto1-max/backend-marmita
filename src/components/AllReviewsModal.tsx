// All Reviews Modal Component

import React from 'react';
import { Star, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllReviews } from '@/data/reviews';
import ReviewCard from './ReviewCard';

interface AllReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AllReviewsModal: React.FC<AllReviewsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const allReviews = getAllReviews();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <span>Avaliações dos Clientes</span>
            <span className="text-accent">⭐</span>
          </DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-accent text-accent" />
              ))}
            </div>
            <span className="text-sm font-medium">5.0</span>
            <span className="text-sm text-muted-foreground">
              ({allReviews.length} avaliações)
            </span>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh] px-4 py-2">
          <div className="flex flex-col gap-4 pb-4">
            {allReviews.map((review) => (
              <ReviewCard key={review.id} review={review} compact={false} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AllReviewsModal;
