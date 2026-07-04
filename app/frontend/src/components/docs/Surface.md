<page url="/en/docs/react/components/surface">
# Surface

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/surface
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/react/components/(layout)/surface.mdx
> Container component that provides surface-level styling and context for child components


***

## Import

```tsx
import { Surface } from '@heroui/react';

```

### Usage

```tsx
import {Surface} from "@heroui/react";

export function Variants() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Default</p>
        <Surface className="flex min-w-[320px] flex-col gap-3 rounded-3xl p-6" variant="default">
          <h3 className="text-base font-semibold text-foreground">Surface Content</h3>
          <p className="text-sm text-muted">
            This is a default surface variant. It uses bg-surface styling.
          </p>
        </Surface>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Secondary</p>
        <Surface className="flex min-w-[320px] flex-col gap-3 rounded-3xl p-6" variant="secondary">
          <h3 className="text-base font-semibold text-foreground">Surface Content</h3>
          <p className="text-sm text-muted">
            This is a secondary surface variant. It uses bg-surface-secondary styling.
          </p>
        </Surface>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Tertiary</p>
        <Surface className="flex min-w-[320px] flex-col gap-3 rounded-3xl p-6" variant="tertiary">
          <h3 className="text-base font-semibold text-foreground">Surface Content</h3>
          <p className="text-sm text-muted">
            This is a tertiary surface variant. It uses bg-surface-tertiary styling.
          </p>
        </Surface>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Transparent</p>
        <Surface
          className="flex min-w-[320px] flex-col gap-3 rounded-3xl border p-6"
          variant="transparent"
        >
          <h3 className="text-base font-semibold text-foreground">Surface Content</h3>
          <p className="text-sm text-muted">
            This is a transparent surface variant. It has no background, suitable for overlays and
            cards with custom backgrounds.
          </p>
        </Surface>
      </div>
    </div>
  );
}

```

## Overview

The Surface component is a semantic container that provides different levels of visual prominence through variants.

### Variants

Surface comes in semantic variants that describe their prominence level:

- **`default`** - Standard surface appearance (bg-surface)
- **`secondary`** - Medium prominence (bg-surface-secondary)
- **`tertiary`** - Higher prominence (bg-surface-tertiary)

## Usage with Form Components

When using form components inside a Surface, use the `variant="secondary"` prop to apply the lower emphasis variant suitable for surface backgrounds.

```tsx
import { Surface, Input, TextArea } from '@heroui/react';

function App() {
  return (
    <Surface variant="default">
      <Input placeholder="Input with secondary variant" variant="secondary" />
      <TextArea placeholder="TextArea with secondary variant" variant="secondary" />
    </Surface>
  );
}

```

## Related Components

- **CheckboxGroup**: Group of checkboxes with shared state
- **Fieldset**: Group related form controls with legends
- **InputOTP**: One-time password input

## Styling

### Passing Tailwind CSS classes

```tsx
import { Surface } from '@heroui/react';

function CustomSurface() {
  return (
    <Surface
      className="rounded-2xl p-8 shadow-lg"
      variant="secondary"
    >
      <h2>Custom Styled Surface</h2>
      <p>Content goes here</p>
    </Surface>
  );
}

```

### Customizing the component classes

To customize the Surface component classes, you can use the `@layer components` directive.
<br/>[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .surface {
    @apply rounded-2xl border border-border;
  }

  .surface--secondary {
    @apply bg-gradient-to-br from-blue-50 to-purple-50;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Surface component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/surface.css)):

#### Base Classes

- `.surface` - Base surface container

#### Variant Classes

- `.surface--default` - Default surface variant (bg-surface)
- `.surface--secondary` - Secondary surface variant (bg-surface-secondary)
- `.surface--tertiary` - Tertiary surface variant (bg-surface-tertiary)

## API Reference

### Surface Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | ` "transparent" \| "default" \| "secondary" \| "tertiary"` | `"default"` | The visual variant of the surface |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The surface content |

## Context API

### SurfaceContext

Child components can access the Surface context to get the current variant:

```tsx
import { useContext } from 'react';
import { SurfaceContext } from '@heroui/react';

function MyComponent() {
  const { variant } = useContext(SurfaceContext);
  // variant will be "transparent" | "default" | "secondary" | "tertiary" | undefined
}

```
</page>