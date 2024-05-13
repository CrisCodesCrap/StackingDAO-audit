import { cn } from '@/app/common/class-names';
import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  prefixIcon?: React.ReactElement;
  suffixIcon?: React.ReactElement;
}

export function Badge({ text, className, prefixIcon, suffixIcon, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-md bg-dark-green-600 px-2.5 py-0.5 text-white',
        className
      )}
    >
      {prefixIcon}
      <p className="whitespace-nowrap text-xs">{text}</p>
      {suffixIcon}
    </span>
  );
}
