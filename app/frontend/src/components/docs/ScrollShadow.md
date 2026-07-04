<page url="/en/docs/react/components/scroll-shadow">
# ScrollShadow

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/scroll-shadow
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/react/components/(utilities)/scroll-shadow.mdx
> Apply visual shadows to indicate scrollable content overflow with automatic detection of scroll position.


***

## Import

```tsx
import { ScrollShadow } from "@heroui/react";

```

## Usage

```tsx
import {ScrollShadow} from "@heroui/react";

export default function Default() {
  return (
    <div className="w-full p-0 sm:max-w-sm">
      <ScrollShadow className="max-h-[240px] p-4">
        <div className="space-y-4">
          {Array.from({length: 10}).map((_, idx) => (
            <p key={`scroll-shadow-lorem-content-${idx}`}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
              risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor quam.
              Morbi accumsan cursus enim, sed ultricies sapien.
            </p>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
}

```

## Orientation

```tsx
import {Card, ScrollShadow} from "@heroui/react";

const images = [
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/robot1.jpeg",
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/avocado.jpeg",
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/oranges.jpeg",
];

export default function Orientation() {
  const getRandomImage = (idx: number) => {
    return images[idx % images.length];
  };

  return (
    <div className="w-full sm:max-w-sm">
      <div className="mb-8 w-full">
        <h4 className="mb-2 text-sm font-semibold">Vertical</h4>
        <Card className="w-full p-0">
          <ScrollShadow className="max-h-[240px] p-4" orientation="vertical">
            <div className="space-y-4">
              {Array.from({length: 10}).map((_, idx) => (
                <p key={`scroll-shadow-lorem-content-${idx}`}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                  risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                  quam. Morbi accumsan cursus enim, sed ultricies sapien.
                </p>
              ))}
            </div>
          </ScrollShadow>
        </Card>
      </div>

      <div className="w-full">
        <h4 className="mb-2 text-sm font-semibold">Horizontal</h4>
        <Card className="w-full p-0">
          <ScrollShadow className="p-4" orientation="horizontal">
            <div className="flex flex-row gap-4">
              {Array.from({length: 10}).map((_, idx) => (
                <Card
                  key={`scroll-shadow-lorem-cards-${idx}`}
                  className="flex min-w-[200px] flex-row gap-3 p-1"
                  variant="transparent"
                >
                  <img
                    alt="Lorem Card"
                    className="aspect-square h-16 w-16 shrink-0 rounded-xl object-cover select-none sm:h-20 sm:w-20"
                    loading="lazy"
                    src={getRandomImage(idx)}
                  />
                  <div className="flex flex-1 flex-col justify-center gap-1">
                    <Card.Title className="text-sm">Bridging the Future</Card.Title>
                    <Card.Description className="text-xs">Today, 6:30 PM</Card.Description>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollShadow>
        </Card>
      </div>
    </div>
  );
}

```

## Hide Scroll Bar

```tsx
import {ScrollShadow} from "@heroui/react";

export default function HideScrollBar() {
  return (
    <div className="w-full p-0 sm:max-w-sm">
      <ScrollShadow hideScrollBar className="max-h-[240px] p-4">
        <div className="space-y-4">
          {Array.from({length: 10}).map((_, idx) => (
            <p key={`scroll-shadow-lorem-content-${idx}`}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
              risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor quam.
              Morbi accumsan cursus enim, sed ultricies sapien.
            </p>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
}

```

## Custom Shadow Size

```tsx
import {ScrollShadow} from "@heroui/react";

export default function CustomSize() {
  return (
    <div className="w-full p-0 sm:max-w-sm">
      <ScrollShadow className="max-h-[240px] p-4" size={80}>
        <div className="space-y-4">
          {Array.from({length: 10}).map((_, idx) => (
            <p key={`scroll-shadow-lorem-content-${idx}`}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
              risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor quam.
              Morbi accumsan cursus enim, sed ultricies sapien.
            </p>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
}

```

## Visibility Change

```tsx
"use client";

import type {ScrollShadowVisibility} from "@heroui/react";

import {Card, ScrollShadow} from "@heroui/react";
import {useState} from "react";

const images = [
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/robot1.jpeg",
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/avocado.jpeg",
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/oranges.jpeg",
];

export default function VisibilityChange() {
  const [verticalState, setVerticalState] = useState<ScrollShadowVisibility>("none");
  const [horizontalState, setHorizontalState] = useState<ScrollShadowVisibility>("none");

  const getRandomImage = (idx: number) => {
    return images[idx % images.length];
  };

  return (
    <div className="w-full sm:max-w-sm">
      <div className="mb-8 flex flex-col gap-2">
        <div className="rounded bg-default p-4">
          <p className="text-sm font-semibold">Vertical Shadow State: {verticalState}</p>
        </div>
        <div className="w-full">
          <ScrollShadow
            className="max-h-[240px] p-4"
            orientation="vertical"
            onVisibilityChange={(visibility) => setVerticalState(visibility)}
          >
            <div className="space-y-4">
              {Array.from({length: 10}).map((_, idx) => (
                <p key={`scroll-shadow-lorem-content-${idx}`}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                  risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                  quam. Morbi accumsan cursus enim, sed ultricies sapien.
                </p>
              ))}
            </div>
          </ScrollShadow>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="rounded bg-default p-4">
          <p className="text-sm font-semibold">Horizontal Shadow State: {horizontalState}</p>
        </div>
        <div className="w-full">
          <ScrollShadow
            className="p-4"
            orientation="horizontal"
            onVisibilityChange={(visibility) => setHorizontalState(visibility)}
          >
            <div className="flex flex-row gap-4">
              {Array.from({length: 10}).map((_, idx) => (
                <Card
                  key={`scroll-shadow-lorem-cards-${idx}`}
                  className="flex min-w-[200px] flex-row gap-3 p-1"
                  variant="transparent"
                >
                  <img
                    alt="Lorem Card"
                    className="aspect-square h-16 w-16 shrink-0 rounded-xl object-cover select-none sm:h-20 sm:w-20"
                    loading="lazy"
                    src={getRandomImage(idx)}
                  />
                  <div className="flex flex-1 flex-col justify-center gap-1">
                    <Card.Title className="text-sm">Bridging the Future</Card.Title>
                    <Card.Description className="text-xs">Today, 6:30 PM</Card.Description>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollShadow>
        </div>
      </div>
    </div>
  );
}

```

## With Card

```tsx
import {Button, Card, ScrollShadow} from "@heroui/react";

export default function WithCard() {
  return (
    <Card className="max-w-[400px]">
      <Card.Header>
        <Card.Title>Terms and Conditions</Card.Title>
        <Card.Description>Please review before proceeding</Card.Description>
      </Card.Header>
      <Card.Content className="p-0">
        <ScrollShadow className="h-[300px] px-4" size={80}>
          <div className="space-y-4">
            {Array.from({length: 10}).map((_, idx) => (
              <p key={`scroll-shadow-lorem-content-${idx}`}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                quam. Morbi accumsan cursus enim, sed ultricies sapien.
              </p>
            ))}
          </div>
        </ScrollShadow>
      </Card.Content>
      <Card.Footer className="mt-4 flex flex-row gap-2">
        <Button className="w-full" variant="secondary">
          Cancel
        </Button>
        <Button className="w-full">Accept</Button>
      </Card.Footer>
    </Card>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import {ScrollShadow, Card} from "@heroui/react";

function CustomScrollShadow() {
  return (
    <Card className="w-full p-0 sm:max-w-md">
      <ScrollShadow className="max-h-[300px] p-6 bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="space-y-4">
          {Array.from({length: 10}).map((_, idx) => (
            <p key={idx}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
              risus hendrerit venenatis.
            </p>
          ))}
        </div>
      </ScrollShadow>
    </Card>
  );
}

```

### Customizing the component classes

To customize the ScrollShadow component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .scroll-shadow {
    @apply rounded-xl border border-default-200;
  }

  .scroll-shadow--vertical {
    @apply pr-2; /* Add padding for custom scrollbar styling */
  }

  .scroll-shadow--horizontal {
    @apply pb-2;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The ScrollShadow component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/scroll-shadow.css)):

#### Base Classes

- `.scroll-shadow` - Root container element

#### Orientation Variants

- `.scroll-shadow--vertical` - Vertical scrolling (default)
- `.scroll-shadow--horizontal` - Horizontal scrolling

#### State Modifiers

- `.scroll-shadow--hide-scrollbar` - Hides native scrollbar

### CSS Variables

The ScrollShadow component uses CSS variables to size the fade mask and reserve space for visible native scrollbars:

| Variable                          | Default                                | Description                                                                                                      |
| --------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--scroll-shadow-size`            | `40px`                                 | Controls the fade gradient size. This is set from the `size` prop.                                               |
| `--scroll-shadow-scrollbar-size`  | `10px` (`0px` when `hideScrollBar`)    | Reserves a solid mask gutter for the native scrollbar so the fade does not cover it. Override for wider scrollbars. |

### Data Attributes

The component uses data attributes to control shadow visibility:

- **Scroll States**: `[data-top-scroll]`, `[data-bottom-scroll]`, `[data-left-scroll]`, `[data-right-scroll]` - Applied when content can be scrolled in that direction
- **Combined States**: `[data-top-bottom-scroll]`, `[data-left-right-scroll]` - Applied when content can be scrolled in both directions
- **Orientation**: `[data-orientation="vertical"]` or `[data-orientation="horizontal"]` - Indicates scroll direction
- **Size**: `[data-scroll-shadow-size]` - Contains the shadow gradient size value

## API Reference

### ScrollShadow

| Prop                 | Type                                                                          | Default      | Description                                             |
| -------------------- | ----------------------------------------------------------------------------- | ------------ | ------------------------------------------------------- |
| `orientation`        | `"vertical"` \| `"horizontal"`                                                | `"vertical"` | The scroll direction                                    |
| `variant`            | `"fade"`                                                                      | `"fade"`     | The visual shadow effect style                          |
| `size`               | `number`                                                                      | `40`         | The shadow gradient size in pixels                      |
| `offset`             | `number`                                                                      | `0`          | The scroll offset before showing shadows (in pixels)    |
| `hideScrollBar`      | `boolean`                                                                     | `false`      | Whether to hide the native scrollbar                    |
| `isEnabled`          | `boolean`                                                                     | `true`       | Whether scroll shadow detection is enabled              |
| `visibility`         | `"auto"` \| `"both"` \| `"top"` \| `"bottom"` \| `"left"` \| `"right"` \| `"none"` | `"auto"`     | Controlled shadow visibility state                      |
| `onVisibilityChange` | `(visibility: ScrollShadowVisibility) => void`                                | -            | Callback invoked when shadow visibility changes         |
| `className`          | `string`                                                                      | -            | Additional CSS classes to apply to the root element     |
| `children`           | `ReactNode`                                                                   | -            | The scrollable content                                  |
</page>