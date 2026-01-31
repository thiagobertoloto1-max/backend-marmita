// Pricing utilities with site-wide discount

// Site-wide discount configuration
// Set to 0 to disable discount, or a value like 0.1 for 10%, 0.5 for 50%
export const SITE_DISCOUNT = 0; // Discount disabled - showing original prices

// Apply the site discount to a price
export const applyDiscount = (originalPrice: number): number => {
  return originalPrice * (1 - SITE_DISCOUNT);
};

// Format price with discount applied
export const getDiscountedPrice = (originalPrice: number): number => {
  return Math.round(applyDiscount(originalPrice) * 100) / 100;
};

// Check if discount is active
export const isDiscountActive = (): boolean => {
  return SITE_DISCOUNT > 0;
};

// Get discount percentage for display
export const getDiscountPercentage = (): number => {
  return SITE_DISCOUNT * 100;
};
