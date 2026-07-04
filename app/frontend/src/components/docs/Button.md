<page url="/en/docs/react/components/button">
# Button

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/button
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/react/components/(buttons)/button.mdx
> A clickable button component with multiple variants and states


***

## Import

```tsx
import { Button } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {Button} from "@heroui/react";

export function Basic() {
  return <Button onPress={() => console.log("Button pressed")}>Click me</Button>;
}

```

### Variants

```tsx
import {Button} from "@heroui/react";

export function Variants() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="danger-soft">Danger Soft</Button>
    </div>
  );
}

```

### With Icons

```tsx
import {Envelope, Globe, Plus, TrashBin} from "@gravity-ui/icons";
import {Button} from "@heroui/react";

export function WithIcons() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button>
        <Globe />
        Search
      </Button>
      <Button variant="secondary">
        <Plus />
        Add Member
      </Button>
      <Button variant="tertiary">
        <Envelope />
        Email
      </Button>
      <Button variant="danger">
        <TrashBin />
        Delete
      </Button>
    </div>
  );
}

```

### Icon Only

```tsx
import {Ellipsis, Gear, TrashBin} from "@gravity-ui/icons";
import {Button} from "@heroui/react";

export function IconOnly() {
  return (
    <div className="flex gap-3">
      <Button isIconOnly variant="tertiary">
        <Ellipsis />
      </Button>
      <Button isIconOnly variant="secondary">
        <Gear />
      </Button>
      <Button isIconOnly variant="danger">
        <TrashBin />
      </Button>
    </div>
  );
}

```

### Loading

```tsx
"use client";

import {Button, Spinner} from "@heroui/react";
import React from "react";

export function Loading() {
  return (
    <Button isPending>
      {({isPending}) => (
        <>
          {isPending ? <Spinner color="current" size="sm" /> : null}
          Uploading...
        </>
      )}
    </Button>
  );
}

```

### Loading State

```tsx
"use client";

import {Paperclip} from "@gravity-ui/icons";
import {Button, Spinner} from "@heroui/react";
import React, {useState} from "react";

export function LoadingState() {
  const [isLoading, setLoading] = useState(false);

  const handlePress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Button isPending={isLoading} onPress={handlePress}>
      {({isPending}) => (
        <>
          {isPending ? <Spinner color="current" size="sm" /> : <Paperclip />}
          {isPending ? "Uploading..." : "Upload File"}
        </>
      )}
    </Button>
  );
}

```

### Sizes

```tsx
import {Button} from "@heroui/react";

export function Sizes() {
  return (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}

```

### Full Width

```tsx
import {Plus} from "@gravity-ui/icons";
import {Button} from "@heroui/react";

export function FullWidth() {
  return (
    <div className="w-[400px] space-y-3">
      <Button fullWidth>Primary Button</Button>
      <Button fullWidth>
        <Plus />
        With Icon
      </Button>
    </div>
  );
}

```

### Disabled State

```tsx
import {Button} from "@heroui/react";

export function Disabled() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button isDisabled>Primary</Button>
      <Button isDisabled variant="secondary">
        Secondary
      </Button>
      <Button isDisabled variant="tertiary">
        Tertiary
      </Button>
      <Button isDisabled variant="outline">
        Outline
      </Button>
      <Button isDisabled variant="ghost">
        Ghost
      </Button>
      <Button isDisabled variant="danger">
        Danger
      </Button>
    </div>
  );
}

```

### Social Buttons

```tsx
import {Button} from "@heroui/react";
import {Icon} from "@iconify/react";

export function Social() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Button className="w-full" variant="tertiary">
        <Icon icon="devicon:google" />
        Sign in with Google
      </Button>
      <Button className="w-full" variant="tertiary">
        <Icon icon="mdi:github" />
        Sign in with GitHub
      </Button>
      <Button className="w-full" variant="tertiary">
        <Icon icon="ion:logo-apple" />
        Sign in with Apple
      </Button>
    </div>
  );
}

```

### Custom Render Function

```tsx
"use client";

import {Button} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <Button
      render={(props, {isPressed}) => (
        <button {...props} data-custom={isPressed ? "pressed" : "bar"} />
      )}
    >
      Press me
    </Button>
  );
}

```

## Related Components

- **Popover**: Displays content in context with a trigger
- **Tooltip**: Contextual information on hover or focus
- **Form**: Form validation and submission handling

<RelatedShowcases component="Button" />

## Styling

### Passing Tailwind CSS classes

```tsx
import { Button } from '@heroui/react';

function CustomButton() {
  return (
    <Button className="bg-purple-500 text-white hover:bg-purple-600">
      Purple Button
    </Button>
  );
}

```

### Customizing the component classes

To customize the Button component classes, you can use the `@layer components` directive.
<br/>[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .button {
    @apply bg-purple-500 text-white hover:bg-purple-600;
  }

  .button--icon-only {
    @apply rounded-lg bg-blue-500;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### Adding custom variants

You can extend HeroUI components by wrapping them and adding your own custom variants.

```tsx
import type {ButtonProps} from "@heroui/react";
import type {VariantProps} from "tailwind-variants";

import {Button, buttonVariants} from "@heroui/react";
import {tv} from "tailwind-variants";

const myButtonVariants = tv({
  base: "text-md font-semibold shadow-md text-shadow-lg data-[pending=true]:opacity-40",
  defaultVariants: {
    radius: "full",
    variant: "primary",
  },
  extend: buttonVariants,
  variants: {
    radius: {
      full: "rounded-full",
      lg: "rounded-lg",
      md: "rounded-md",
      sm: "rounded-sm",
    },
    size: {
      lg: "h-12 px-8",
      md: "h-11 px-6",
      sm: "h-10 px-4",
      xl: "h-13 px-10",
    },
    variant: {
      primary: "text-white dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
    },
  },
});

type MyButtonVariants = VariantProps<typeof myButtonVariants>;
export type MyButtonProps = Omit<ButtonProps, "className"> &
  MyButtonVariants & {className?: string};

function CustomButton({className, radius, variant, ...props}: MyButtonProps) {
  return <Button className={myButtonVariants({className, radius, variant})} {...props} />;
}

export function CustomVariants() {
  return <CustomButton>Custom Button</CustomButton>;
}

```

### Adding Ripple Effect

The Button component supports ripple effects through composition, allowing you to nest ripple components as children. This example uses [m3-ripple](https://github.com/saltyaom/m3-ripple).

```tsx
"use client";

import {Button} from "@heroui/react";
import {Ripple} from "m3-ripple";

import "m3-ripple/ripple.css";

export function RippleEffect() {
  return (
    <Button variant="secondary">
      <Ripple />
      Click me
    </Button>
  );
}

```

### CSS Classes

The Button component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/button.css)):

#### Base & Size Classes

- `.button` - Base button styles
- `.button--sm` - Small size variant
- `.button--md` - Medium size variant
- `.button--lg` - Large size variant

#### Variant Classes

- `.button--primary`
- `.button--secondary`
- `.button--tertiary`
- `.button--outline`
- `.button--ghost`
- `.button--danger`

#### Modifier Classes

- `.button--icon-only`
- `.button--icon-only.button--sm`
- `.button--icon-only.button--lg`

### Interactive States

The button supports both CSS pseudo-classes and data attributes for flexibility:

- **Hover**: `:hover` or `[data-hovered="true"]`
- **Active/Pressed**: `:active` or `[data-pressed="true"]` (includes scale transform)
- **Focus**: `:focus-visible` or `[data-focus-visible="true"]` (shows focus ring)
- **Disabled**: `:disabled` or `[aria-disabled="true"]` (reduced opacity, no pointer events)
- **Pending**: `[data-pending]` (no pointer events during loading)

## API Reference

### Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the button |
| `fullWidth` | `boolean` | `false` | Whether the button should take full width of its container |
| `isDisabled` | `boolean` | `false` | Whether the button is disabled |
| `isPending` | `boolean` | `false` | Whether the button is in a loading state |
| `isIconOnly` | `boolean` | `false` | Whether the button contains only an icon |
| `onPress` | `(e: PressEvent) => void` | - | Handler called when the button is pressed |
| `children` | `React.ReactNode \| (values: ButtonRenderProps) => React.ReactNode` | - | Button content or render prop |
| `render` | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, ButtonRenderProps>` | - | Overrides the default DOM element with a custom render function.|

### ButtonRenderProps

When using the render prop pattern, these values are provided:

| Prop | Type | Description |
|------|------|-------------|
| `isPending` | `boolean` | Whether the button is in a loading state |
| `isPressed` | `boolean` | Whether the button is currently pressed |
| `isHovered` | `boolean` | Whether the button is hovered |
| `isFocused` | `boolean` | Whether the button is focused |
| `isFocusVisible` | `boolean` | Whether the button should show focus indicator |
| `isDisabled` | `boolean` | Whether the button is disabled |
</page>