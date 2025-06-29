
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number; // 1-5
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

export function StarRating({ rating, size = 'md', showNumber = false, className }: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  const starSize = sizeClasses[size];
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              "transition-colors",
              star <= rating
                ? "fill-green-500 text-green-500"
                : "fill-none text-gray-400 stroke-2"
            )}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm text-gray-400 ml-1">
          ({rating}/5)
        </span>
      )}
    </div>
  );
}
