'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Props = {
  available: number;
  className?: string;
};

export function AvailabilityBadge({ available, className }: Props) {
  if (available <= 0) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-destructive/30 bg-destructive/10 text-destructive',
          className,
        )}
      >
        Indisponível
      </Badge>
    );
  }
  if (available <= 2) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-chart-4/40 bg-chart-4/10 text-chart-4',
          className,
        )}
      >
        {available} disponíveis
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className={cn('border-primary/30 bg-primary/10 text-primary', className)}
    >
      {available} disponíveis
    </Badge>
  );
}
