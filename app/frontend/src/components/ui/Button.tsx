import React from 'react';
import { Button as HeroButton } from '@heroui/react';

// ─── Variant design tokens ────────────────────────────────────────────────────
// Keep ALL visual defaults here so callers only specify intent (variant),
// not implementation details (padding, rounding, shadow, transition…).
const VARIANT_CLASSES: Record<string, string> = {
  primary: 'w-full py-3 rounded-2xl shadow-lg transition-all text-sm',
  outline: 'py-3 rounded-2xl transition-all text-sm',
  danger:  'py-3 rounded-2xl transition-all text-sm',
  ghost:   'py-3 rounded-2xl transition-all text-sm',
  default: 'py-3 rounded-2xl transition-all text-sm',
};

export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof HeroButton> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', variant, ...props }, ref) => {
    // Merge variant-level base classes with any caller-supplied extras
    const variantKey = (variant as string) ?? 'default';
    const base = VARIANT_CLASSES[variantKey] ?? VARIANT_CLASSES.default;
    const merged = [base, className].filter(Boolean).join(' ');

    return (
      <HeroButton
        ref={ref}
        variant={variant}
        className={merged}
        {...props}
      >
        {children}
      </HeroButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
