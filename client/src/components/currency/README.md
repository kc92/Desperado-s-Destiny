# Currency Display Components

Reusable React components for displaying currency and resources in Desperados Destiny.

## Components

### DollarsDisplay
Display dollar amounts with green styling and optional money emoji.

```tsx
import { DollarsDisplay } from '@/components/currency';

<DollarsDisplay amount={1500} />
// Output: 💵 $1,500

<DollarsDisplay amount={250} showIcon={false} size="sm" />
// Output: $250 (small, no icon)
```

**Props:**
- `amount: number` - Dollar amount to display (required)
- `className?: string` - Additional CSS classes
- `showIcon?: boolean` - Show 💵 emoji (default: true)
- `size?: 'sm' | 'md' | 'lg'` - Text size (default: 'md')

---

### GoldResourceDisplay
Display gold resource amounts with amber/gold styling and coin emoji.

```tsx
import { GoldResourceDisplay } from '@/components/currency';

<GoldResourceDisplay amount={50} />
// Output: 🪙 50g

<GoldResourceDisplay amount={50} verbose={true} />
// Output: 🪙 50 Gold
```

**Props:**
- `amount: number` - Gold amount to display (required)
- `className?: string` - Additional CSS classes
- `showIcon?: boolean` - Show 🪙 emoji (default: true)
- `size?: 'sm' | 'md' | 'lg'` - Text size (default: 'md')
- `verbose?: boolean` - Show "Gold" instead of "g" (default: false)

---

### SilverDisplay
Display silver resource amounts with gray/silver styling and coin emoji.

```tsx
import { SilverDisplay } from '@/components/currency';

<SilverDisplay amount={250} />
// Output: 🪙 250s

<SilverDisplay amount={250} verbose={true} />
// Output: 🪙 250 Silver
```

**Props:**
- `amount: number` - Silver amount to display (required)
- `className?: string` - Additional CSS classes
- `showIcon?: boolean` - Show 🪙 emoji (default: true)
- `size?: 'sm' | 'md' | 'lg'` - Text size (default: 'md')
- `verbose?: boolean` - Show "Silver" instead of "s" (default: false)

---

### CurrencyDisplay
Generic wrapper component that renders the appropriate display based on type.

```tsx
import { CurrencyDisplay } from '@/components/currency';

<CurrencyDisplay amount={1000} type="dollars" />
<CurrencyDisplay amount={25} type="gold" verbose={true} />
<CurrencyDisplay amount={150} type="silver" size="sm" />
```

**Props:**
- `amount: number` - Amount to display (required)
- `type: 'dollars' | 'gold' | 'silver'` - Currency type (required)
- `className?: string` - Additional CSS classes
- `showIcon?: boolean` - Show currency icon (default: true)
- `size?: 'sm' | 'md' | 'lg'` - Text size (default: 'md')
- `verbose?: boolean` - Use verbose format for resources (default: false)

---

### ResourceBar
Combined resources display for sidebar showing all currencies in a compact format.

```tsx
import { ResourceBar } from '@/components/currency';

<ResourceBar
  dollars={5000}
  goldResource={75}
  silverResource={320}
/>

// Displays:
// Cash: 💵 $5,000
// ─────────────────
// Gold: 🪙 75g
// Silver: 🪙 320s
```

**Props:**
- `dollars: number` - Dollar amount (required)
- `goldResource?: number` - Optional gold amount
- `silverResource?: number` - Optional silver amount
- `className?: string` - Additional CSS classes

---

## Usage Examples

### In a Character Sheet
```tsx
function CharacterSheet({ character }) {
  return (
    <div>
      <h3>Inventory</h3>
      <DollarsDisplay amount={character.dollars} size="lg" />
      <GoldResourceDisplay amount={character.goldResource} />
      <SilverDisplay amount={character.silverResource} />
    </div>
  );
}
```

### In a Shop
```tsx
function ItemPrice({ price, currency }) {
  return (
    <div className="item-price">
      <span>Price: </span>
      <CurrencyDisplay amount={price} type={currency} />
    </div>
  );
}
```

### In a Sidebar
```tsx
function GameSidebar({ character }) {
  return (
    <aside>
      <ResourceBar
        dollars={character.dollars}
        goldResource={character.inventory.gold}
        silverResource={character.inventory.silver}
      />
    </aside>
  );
}
```

## Styling

All components use Tailwind CSS classes and follow the game's color scheme:
- **Dollars**: Green (`text-green-500`)
- **Gold**: Amber/Yellow (`text-amber-500`, `text-yellow-400`)
- **Silver**: Gray (`text-gray-400`, `text-gray-300`)

You can customize with the `className` prop:
```tsx
<DollarsDisplay
  amount={1000}
  className="font-bold text-xl"
/>
```

## Accessibility

All components include:
- Proper `aria-label` attributes
- Descriptive `title` attributes for tooltips
- Semantic HTML structure
- Screen reader friendly text
