<page url="/en/docs/react/components/avatar">
# Avatar

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/avatar
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/react/components/(media)/avatar.mdx
> Display user profile images with customizable fallback content


***

## Import

```tsx
import { Avatar } from '@heroui/react';

```

### Usage

```tsx
import {Avatar} from "@heroui/react";

export function Basic() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <Avatar.Image alt="John Doe" src="https://img.heroui.chat/image/avatar?w=400&h=400&u=3" />
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Image
          alt="Blue"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
        />
        <Avatar.Fallback>B</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback>JR</Avatar.Fallback>
      </Avatar>
    </div>
  );
}

```

### Anatomy

Import the Avatar component and access all parts using dot notation.

```tsx
import { Avatar } from '@heroui/react';

export default () => (
  <Avatar>
    <Avatar.Image/>
    <Avatar.Fallback/>
  </Avatar>
)

```

### Sizes

```tsx
import {Avatar} from "@heroui/react";

export function Sizes() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <Avatar.Image
          alt="Small Avatar"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
        />
        <Avatar.Fallback>SM</Avatar.Fallback>
      </Avatar>
      <Avatar size="md">
        <Avatar.Image
          alt="Medium Avatar"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg"
        />
        <Avatar.Fallback>MD</Avatar.Fallback>
      </Avatar>
      <Avatar size="lg">
        <Avatar.Image
          alt="Large Avatar"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg"
        />
        <Avatar.Fallback>LG</Avatar.Fallback>
      </Avatar>
    </div>
  );
}

```

### Colors

```tsx
import {Avatar} from "@heroui/react";

export function Colors() {
  return (
    <div className="flex items-center gap-4">
      <Avatar color="default">
        <Avatar.Fallback>DF</Avatar.Fallback>
      </Avatar>
      <Avatar color="accent">
        <Avatar.Fallback>AC</Avatar.Fallback>
      </Avatar>
      <Avatar color="success">
        <Avatar.Fallback>SC</Avatar.Fallback>
      </Avatar>
      <Avatar color="warning">
        <Avatar.Fallback>WR</Avatar.Fallback>
      </Avatar>
      <Avatar color="danger">
        <Avatar.Fallback>DG</Avatar.Fallback>
      </Avatar>
    </div>
  );
}

```

### Variants

```tsx
import {Person} from "@gravity-ui/icons";
import {Avatar, Separator} from "@heroui/react";

export function Variants() {
  const colors = ["accent", "default", "success", "warning", "danger"] as const;
  const variants = [
    {content: "AG", label: "letter", type: "letter"},
    {content: "AG", label: "letter soft", type: "letter-soft"},
    {content: <Person />, label: "icon", type: "icon"},
    {content: <Person />, label: "icon soft", type: "icon-soft"},
    {
      content: [
        "https://img.heroui.chat/image/avatar?w=400&h=400&u=3",
        "https://img.heroui.chat/image/avatar?w=400&h=400&u=4",
        "https://img.heroui.chat/image/avatar?w=400&h=400&u=5",
        "https://img.heroui.chat/image/avatar?w=400&h=400&u=8",
        "https://img.heroui.chat/image/avatar?w=400&h=400&u=16",
      ],
      label: "img",
      type: "img",
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      {/* Color labels header */}
      <div className="flex items-center gap-3">
        <div className="w-24 shrink-0" />
        {colors.map((color) => (
          <div key={color} className="flex w-20 shrink-0 items-center justify-center">
            <span className="text-xs text-muted capitalize">{color}</span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Variant rows */}
      {variants.map((variant) => (
        <div key={variant.label} className="flex items-center gap-3">
          <div className="w-24 shrink-0 text-sm text-muted">{variant.label}</div>
          {colors.map((color, colorIndex) => (
            <div key={color} className="flex w-20 shrink-0 items-center justify-center">
              <Avatar color={color} variant={variant.type.includes("soft") ? "soft" : undefined}>
                {variant.type === "img" ? (
                  <>
                    <Avatar.Image
                      alt={`Avatar ${color}`}
                      src={Array.isArray(variant.content) ? variant.content[colorIndex] : ""}
                    />
                    <Avatar.Fallback>{color.charAt(0).toUpperCase()}</Avatar.Fallback>
                  </>
                ) : (
                  <Avatar.Fallback>{variant.content}</Avatar.Fallback>
                )}
              </Avatar>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

```

### Fallback Content

```tsx
import {Person} from "@gravity-ui/icons";
import {Avatar} from "@heroui/react";

export function Fallback() {
  return (
    <div className="flex items-center gap-4">
      {/* Text fallback */}
      <Avatar>
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>

      {/* Icon fallback */}
      <Avatar>
        <Avatar.Fallback>
          <Person />
        </Avatar.Fallback>
      </Avatar>

      {/* Fallback with delay */}
      <Avatar>
        <Avatar.Image
          alt="Delayed Avatar"
          src="https://invalid-url-to-show-fallback.com/image.jpg"
        />
        <Avatar.Fallback delayMs={600}>NA</Avatar.Fallback>
      </Avatar>

      {/* Custom styled fallback */}
      <Avatar>
        <Avatar.Fallback className="border-none bg-gradient-to-br from-pink-500 to-purple-500 text-white">
          GB
        </Avatar.Fallback>
      </Avatar>
    </div>
  );
}

```

### Avatar Group

```tsx
import {Avatar} from "@heroui/react";

const users = [
  {
    id: 1,
    image: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg",
    name: "John Doe",
  },
  {
    id: 2,
    image: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg",
    name: "Kate Wilson",
  },
  {
    id: 3,
    image: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg",
    name: "Emily Chen",
  },
  {
    id: 4,
    image: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg",
    name: "Michael Brown",
  },
  {
    id: 5,
    image: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg",
    name: "Olivia Davis",
  },
];

export function Group() {
  return (
    <div className="flex flex-col gap-6">
      {/* Basic avatar group */}
      <div className="flex -space-x-2">
        {users.slice(0, 4).map((user) => (
          <Avatar key={user.id} className="ring-2 ring-background">
            <Avatar.Image alt={user.name} src={user.image} />
            <Avatar.Fallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Avatar.Fallback>
          </Avatar>
        ))}
      </div>

      {/* Avatar group with counter */}
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user) => (
          <Avatar key={user.id} className="ring-2 ring-background">
            <Avatar.Image alt={user.name} src={user.image} />
            <Avatar.Fallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Avatar.Fallback>
          </Avatar>
        ))}
        <Avatar className="ring-2 ring-background">
          <Avatar.Fallback className="text-xs">+{users.length - 3}</Avatar.Fallback>
        </Avatar>
      </div>
    </div>
  );
}

```

### Custom Styles

```tsx
import {Avatar} from "@heroui/react";

export function CustomStyles() {
  return (
    <div className="flex items-center gap-4">
      {/* Custom size with Tailwind classes */}
      <Avatar className="size-16">
        <Avatar.Image
          alt="Extra Large"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
        />
        <Avatar.Fallback>XL</Avatar.Fallback>
      </Avatar>

      {/* Square avatar */}
      <Avatar className="rounded-lg">
        <Avatar.Image
          alt="Square Avatar"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg"
        />
        <Avatar.Fallback className="rounded-lg">SQ</Avatar.Fallback>
      </Avatar>

      {/* Gradient border */}
      <Avatar className="bg-gradient-to-tr from-pink-500 to-yellow-500 p-0.5">
        <div className="size-full rounded-full bg-background p-0.5">
          <Avatar.Image
            alt="Gradient Border"
            className="rounded-full"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg"
          />
          <Avatar.Fallback className="border-none">GB</Avatar.Fallback>
        </div>
      </Avatar>

      {/* Status indicator */}
      <div className="relative">
        <Avatar>
          <Avatar.Image
            alt="Online User"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg"
          />
          <Avatar.Fallback>ON</Avatar.Fallback>
        </Avatar>
        <span className="absolute right-0 bottom-0 size-3 rounded-full bg-green-500 ring-2 ring-background" />
      </div>
    </div>
  );
}

```

## Related Components

- **Separator**: Visual divider between content
- **Badge**: Small indicator positioned relative to another element

## Styling

### Passing Tailwind CSS classes

```tsx
import { Avatar } from '@heroui/react';

function CustomAvatar() {
  return (
    <Avatar className="size-20">
      <Avatar.Image src="..." alt="..." />
      <Avatar.Fallback>XL</Avatar.Fallback>
    </Avatar>
  );
}

```

### Customizing the component classes

To customize the Avatar component classes, you can use the `@layer components` directive.
<br/>[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .avatar {
    @apply size-16 border-2 border-primary;
  }

  .avatar__fallback {
    @apply bg-gradient-to-br from-purple-500 to-pink-500;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Avatar component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/avatar.css)):

#### Base Classes

- `.avatar` - Base container with default size (size-10)
- `.avatar__image` - Image element with aspect-square sizing
- `.avatar__fallback` - Fallback container with centered content

#### Size Modifiers

- `.avatar--sm` - Small avatar (size-8)
- `.avatar--md` - Medium avatar (default, no additional styles)
- `.avatar--lg` - Large avatar (size-12)

#### Variant Modifiers

- `.avatar--soft` - Soft variant with lighter background

#### Color Modifiers

- `.avatar__fallback--default` - Default text color
- `.avatar__fallback--accent` - Accent text color
- `.avatar__fallback--success` - Success text color
- `.avatar__fallback--warning` - Warning text color
- `.avatar__fallback--danger` - Danger text color

## API Reference

### Avatar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Avatar size |
| `color` | `'default' \| 'accent' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Fallback color theme |
| `variant` | `'default' \| 'soft'` | `'default'` | Visual style variant |
| `className` | `string` | - | Additional CSS classes |

### Avatar.Image Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Image source URL |
| `srcSet` | `string` | - | The image `srcset` attribute for responsive images |
| `sizes` | `string` | - | The image `sizes` attribute for responsive images |
| `alt` | `string` | - | Alternative text for the image |
| `onLoad` | `(event: SyntheticEvent<HTMLImageElement>) => void` | - | Callback when the image loads successfully |
| `onError` | `(event: SyntheticEvent<HTMLImageElement>) => void` | - | Callback when there's an error loading the image |
| `crossOrigin` | `'anonymous' \| 'use-credentials'` | - | CORS setting for the image request |
| `loading` | `'eager' \| 'lazy'` | - | Native lazy loading attribute |
| `className` | `string` | - | Additional CSS classes |

### Avatar.Fallback Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `delayMs` | `number` | - | Delay before showing fallback (prevents flash) |
| `color` | `'default' \| 'accent' \| 'success' \| 'warning' \| 'danger'` | - | Override color from parent |
| `className` | `string` | - | Additional CSS classes |
</page>