# DESPERADOS DESTINY - DESIGN SYSTEM & COMPONENT LIBRARY
## Complete Visual Language & Reusable Components

**Version:** 1.0
**Last Updated:** November 15, 2025
**Status:** Phase 0.75 - Foundation Planning

---

## OVERVIEW

This document defines the complete design system for Desperados Destiny, ensuring visual consistency and reusable components across the entire application.

**Design Philosophy:**
- **Western Aesthetic:** Weathered textures, earthy tones, playing card motifs
- **Readability First:** Clean typography, sufficient contrast, clear hierarchy
- **Responsive by Default:** All components work on mobile, tablet, desktop
- **Accessible:** WCAG 2.1 AA compliant

---

## TABLE OF CONTENTS

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Component Library](#component-library)
5. [Icons](#icons)
6. [Animations & Transitions](#animations--transitions)
7. [Layout Grid](#layout-grid)
8. [Design Tokens](#design-tokens)
9. [Implementation Guidelines](#implementation-guidelines)

---

## COLOR PALETTE

### Primary Colors

**Frontier Red** (Primary brand color)
- **Main:** `#C44536` - Deep rust red (duels, combat, primary CTA)
- **Light:** `#D6655A` - Lighter shade (hover states)
- **Dark:** `#9D3529` - Darker shade (active states)

**Dust Gold** (Secondary brand color)
- **Main:** `#D4A574` - Weathered gold (currency, highlights)
- **Light:** `#E6C59B` - Light gold (backgrounds)
- **Dark:** `#B8895F` - Dark gold (borders, text)

**Leather Brown** (Tertiary color)
- **Main:** `#5C4033` - Rich brown (backgrounds, cards)
- **Light:** `#7A5447` - Light brown (hover)
- **Dark:** `#3D2921` - Dark brown (shadows, text)

---

### Faction Colors

**Settler Alliance** (Blue-gray)
- **Main:** `#4A6FA5` - Steel blue
- **Light:** `#6B8BBD`
- **Dark:** `#375380`

**Nahi Coalition** (Earth tones)
- **Main:** `#8B6F47` - Earthy brown
- **Light:** `#A98D68`
- **Dark:** `#6B5538`

**Frontera** (Charcoal red)
- **Main:** `#8C3F2F` - Burnt sienna
- **Light:** `#A6594A`
- **Dark:** `#6D3024`

---

### Semantic Colors

**Success (Positive actions, wins)**
- **Main:** `#5A8F5A` - Muted green
- **Light:** `#7AAA7A`
- **Dark:** `#456D45`

**Warning (Alerts, low energy)**
- **Main:** `#D49A3C` - Warm yellow
- **Light:** `#E6B265`
- **Dark:** `#B37F2F`

**Danger (Errors, defeats, critical)**
- **Main:** `#C44536` - (Same as primary red)
- **Light:** `#D6655A`
- **Dark:** `#9D3529`

**Info (Informational messages)**
- **Main:** `#5A7FA5` - Dusty blue
- **Light:** `#7A9BBD`
- **Dark:** `#456380`

---

### Neutral Grays

**Background Grays**
- **Lightest:** `#F5F1EC` - Parchment white
- **Light:** `#E6DFD8` - Light tan
- **Medium:** `#C9BFB5` - Medium tan
- **Dark:** `#8C8379` - Dark tan
- **Darkest:** `#3D3833` - Almost black

**Text Grays**
- **Primary Text:** `#2D2926` - Near black
- **Secondary Text:** `#6B635C` - Medium gray
- **Disabled Text:** `#A39C94` - Light gray

---

### Suit Colors (Card Symbols)

- **Spades (♠):** `#2D2926` - Black
- **Hearts (♥):** `#C44536` - Red
- **Clubs (♣):** `#2D2926` - Black
- **Diamonds (♦):** `#C44536` - Red

---

### Color Usage Guidelines

**Backgrounds:**
- Primary background: `#F5F1EC` (Parchment)
- Card backgrounds: `#FFFFFF` with subtle texture overlay
- Dark mode (future): `#2D2926` backgrounds with light text

**Buttons:**
- Primary CTA: Frontier Red `#C44536`
- Secondary: Dust Gold `#D4A574`
- Tertiary: Leather Brown `#5C4033`
- Danger: Same as primary (context differentiates)

**Text:**
- Headings: `#2D2926` (Near black)
- Body: `#3D3833` (Dark gray)
- Muted: `#6B635C` (Medium gray)

---

## TYPOGRAPHY

### Font Families

**Headings (Display Font):**
- **Font:** "Rye" (Google Fonts) - Western slab serif
- **Fallback:** Georgia, serif
- **Usage:** H1, H2, H3, logo, titles

**Body (Sans-Serif):**
- **Font:** "Inter" (Google Fonts) - Clean, readable sans-serif
- **Fallback:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Usage:** Body text, UI labels, buttons

**Monospace (Numbers, Code):**
- **Font:** "JetBrains Mono" (Google Fonts) - Readable monospace
- **Fallback:** "Courier New", monospace
- **Usage:** Stats, gold amounts, energy counters

---

### Font Sizes

**Desktop Scale:**
```css
--font-xs: 0.75rem;    /* 12px - Small labels, captions */
--font-sm: 0.875rem;   /* 14px - Secondary text, metadata */
--font-base: 1rem;     /* 16px - Body text, buttons */
--font-lg: 1.125rem;   /* 18px - Large body text */
--font-xl: 1.25rem;    /* 20px - Small headings (H4) */
--font-2xl: 1.5rem;    /* 24px - Medium headings (H3) */
--font-3xl: 1.875rem;  /* 30px - Large headings (H2) */
--font-4xl: 2.25rem;   /* 36px - Extra large headings (H1) */
--font-5xl: 3rem;      /* 48px - Hero text, page titles */
```

**Mobile Scale (slightly larger base):**
```css
--font-base-mobile: 1.0625rem; /* 17px - Better readability on small screens */
```

---

### Font Weights

```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

**Usage:**
- Headings: `700` (Bold) or `800` (Extrabold for H1)
- Body: `400` (Normal)
- Emphasized: `600` (Semibold)
- Buttons: `600` (Semibold)

---

### Line Heights

```css
--line-height-tight: 1.25;   /* Headings */
--line-height-normal: 1.5;   /* Body text */
--line-height-relaxed: 1.75; /* Large text blocks */
```

---

### Typography Examples

**H1 (Page Title):**
```css
font-family: 'Rye', Georgia, serif;
font-size: 3rem;           /* 48px */
font-weight: 800;
line-height: 1.25;
color: #2D2926;
```

**H2 (Section Title):**
```css
font-family: 'Rye', Georgia, serif;
font-size: 1.875rem;       /* 30px */
font-weight: 700;
line-height: 1.25;
color: #2D2926;
```

**Body Text:**
```css
font-family: 'Inter', sans-serif;
font-size: 1rem;           /* 16px */
font-weight: 400;
line-height: 1.5;
color: #3D3833;
```

**Button Text:**
```css
font-family: 'Inter', sans-serif;
font-size: 1rem;
font-weight: 600;
line-height: 1.5;
text-transform: uppercase;
letter-spacing: 0.5px;
```

---

## SPACING SYSTEM

### Spacing Scale (8px base unit)

```css
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

**Usage Guidelines:**
- **Margins between sections:** `--space-8` (32px) or `--space-12` (48px)
- **Padding inside cards:** `--space-4` (16px) or `--space-6` (24px)
- **Button padding:** `--space-3` `--space-6` (12px 24px)
- **Small gaps (icon + text):** `--space-2` (8px)

---

## COMPONENT LIBRARY

### Buttons

#### Primary Button

**Visual:**
- Background: Frontier Red `#C44536`
- Text: White `#FFFFFF`
- Padding: `12px 24px` (`--space-3 --space-6`)
- Border radius: `4px`
- Font: Inter, 16px, semibold, uppercase
- Hover: Background `#D6655A` (lighter), slight scale (1.02)
- Active: Background `#9D3529` (darker), scale (0.98)
- Disabled: Background `#C9BFB5`, cursor not-allowed

**CSS:**
```css
.btn-primary {
  background-color: var(--color-frontier-red);
  color: #FFFFFF;
  padding: var(--space-3) var(--space-6);
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #D6655A;
  transform: scale(1.02);
}

.btn-primary:active {
  background-color: #9D3529;
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: var(--color-gray-medium);
  cursor: not-allowed;
  opacity: 0.6;
}
```

---

#### Secondary Button

**Visual:**
- Background: Dust Gold `#D4A574`
- Text: Dark Brown `#3D2921`
- Same size/padding as primary
- Hover: Background `#E6C59B`

---

#### Tertiary Button (Outlined)

**Visual:**
- Background: Transparent
- Border: 2px solid Leather Brown `#5C4033`
- Text: Leather Brown `#5C4033`
- Hover: Background Leather Brown, text white

---

#### Icon Button

**Visual:**
- Square (40px × 40px)
- Background: Transparent or light gray
- Icon: 20px
- Border radius: 50% (circular)
- Hover: Background `#E6DFD8`

---

### Cards

#### Base Card

**Visual:**
- Background: White `#FFFFFF`
- Border: 1px solid `#C9BFB5`
- Border radius: `8px`
- Padding: `24px` (`--space-6`)
- Box shadow: `0 2px 8px rgba(45, 41, 38, 0.1)`
- Hover: Box shadow deepens, slight lift

**CSS:**
```css
.card {
  background-color: #FFFFFF;
  border: 1px solid var(--color-gray-medium);
  border-radius: 8px;
  padding: var(--space-6);
  box-shadow: 0 2px 8px rgba(45, 41, 38, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(45, 41, 38, 0.15);
  transform: translateY(-2px);
}
```

---

#### Stat Card

**Variant of base card:**
- Icon (top-left, 32px)
- Label (small text, gray)
- Value (large number, bold)

**Example:**
```
┌─────────────────┐
│ ⚡              │
│ ENERGY          │
│ 125 / 150       │
└─────────────────┘
```

---

#### Character Card (Profile preview)

**Layout:**
```
┌───────────────────────────┐
│ [Avatar] Name             │
│          Level 25         │
│          Frontera         │
│                           │
│ [CHALLENGE] [MESSAGE]     │
└───────────────────────────┘
```

---

### Form Inputs

#### Text Input

**Visual:**
- Border: 1px solid `#C9BFB5`
- Border radius: `4px`
- Padding: `12px 16px`
- Font: Inter, 16px
- Placeholder: `#A39C94` (light gray)
- Focus: Border `#C44536` (Frontier Red), box shadow

**CSS:**
```css
.input-text {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: var(--color-text-primary);
  border: 1px solid var(--color-gray-medium);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.input-text:focus {
  outline: none;
  border-color: var(--color-frontier-red);
  box-shadow: 0 0 0 3px rgba(196, 69, 54, 0.1);
}

.input-text::placeholder {
  color: var(--color-text-disabled);
}
```

---

#### Select Dropdown

**Same styling as text input**
- Chevron icon (right side)
- Hover: Border darkens slightly

---

#### Checkbox

**Visual:**
- Size: 20px × 20px
- Border: 2px solid `#8C8379`
- Checked: Background `#C44536`, white checkmark
- Border radius: `3px`

---

#### Radio Button

**Visual:**
- Size: 20px × 20px
- Border: 2px solid `#8C8379`
- Selected: Inner dot `#C44536` (10px)
- Border radius: 50% (circular)

---

### Badges

#### Status Badges

**Active:**
- Background: `#5A8F5A` (Success green)
- Text: White, 12px, semibold
- Padding: `4px 8px`
- Border radius: `12px` (pill shape)

**Inactive:**
- Background: `#8C8379` (Gray)
- Text: White

**Premium:**
- Background: `#D4A574` (Dust Gold)
- Text: Dark Brown

---

#### Faction Badges

**Settler:**
- Icon: Shield
- Color: `#4A6FA5` (Steel blue)

**Nahi:**
- Icon: Feather
- Color: `#8B6F47` (Earth brown)

**Frontera:**
- Icon: Star
- Color: `#8C3F2F` (Charcoal red)

---

### Progress Bars

**Visual:**
- Height: `12px`
- Background: `#E6DFD8` (Light tan)
- Fill: Gradient (Frontier Red to Dust Gold)
- Border radius: `6px`
- Animated: Fill slides smoothly

**CSS:**
```css
.progress-bar {
  height: 12px;
  background-color: var(--color-gray-light);
  border-radius: 6px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #C44536 0%, #D4A574 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
}
```

---

### Alerts

#### Success Alert

- Background: `#EDF7ED` (light green)
- Border-left: 4px solid `#5A8F5A`
- Icon: Checkmark (green)
- Padding: `16px`

#### Warning Alert

- Background: `#FFF8E6` (light yellow)
- Border-left: 4px solid `#D49A3C`
- Icon: Exclamation triangle (yellow)

#### Error Alert

- Background: `#FCE8E6` (light red)
- Border-left: 4px solid `#C44536`
- Icon: X circle (red)

---

### Tooltips

**Visual:**
- Background: `#2D2926` (Dark gray, 90% opacity)
- Text: White, 14px
- Padding: `8px 12px`
- Border radius: `4px`
- Arrow pointing to element
- Max width: `200px`

**Trigger:**
- Hover (desktop)
- Tap (mobile)

---

### Modals

**Structure:**
```
┌─────────────────────────────────────┐
│ OVERLAY (semi-transparent black)    │
│                                     │
│   ┌──────────────────────────────┐ │
│   │ MODAL                        │ │
│   │                              │ │
│   │  [X] Close                   │ │
│   │                              │ │
│   │  Title                       │ │
│   │  ─────────────               │ │
│   │                              │ │
│   │  Content goes here...        │ │
│   │                              │ │
│   │  [CANCEL]  [CONFIRM]         │ │
│   └──────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Visual:**
- Overlay: `rgba(45, 41, 38, 0.75)`
- Modal: White background, 8px border radius
- Max width: `600px` (desktop), 90% (mobile)
- Padding: `32px`
- Close button: Top-right corner
- Buttons: Bottom-right, primary + secondary

---

## ICONS

### Icon Style

- **Library:** Lucide Icons (open-source, consistent)
- **Stroke width:** 2px
- **Size:** 20px (default), 24px (large), 16px (small)
- **Color:** Inherits from parent or specific color

### Common Icons

- **Energy:** Lightning bolt (`Zap`)
- **Gold:** Dollar sign (`DollarSign`)
- **Health:** Heart (`Heart`)
- **Combat:** Crossed swords (`Swords`)
- **Gangs:** Users (`Users`)
- **Territories:** Map pin (`MapPin`)
- **Skills:** Star (`Star`)
- **Shop:** Shopping cart (`ShoppingCart`)
- **Settings:** Gear (`Settings`)
- **Profile:** User circle (`UserCircle`)
- **Chat:** Message square (`MessageSquare`)
- **Logout:** Log out (`LogOut`)

---

## ANIMATIONS & TRANSITIONS

### Transition Timing

```css
--transition-fast: 0.15s;     /* Hover states, small changes */
--transition-base: 0.3s;      /* Standard transitions */
--transition-slow: 0.5s;      /* Complex animations, modals */
```

### Easing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);      /* Default */
--ease-out: cubic-bezier(0, 0, 0.2, 1);           /* Exiting animations */
--ease-in: cubic-bezier(0.4, 0, 1, 1);            /* Entering animations */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Playful bounce */
```

### Common Animations

**Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
```

**Slide Up:**
```css
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}
```

**Card Flip (Destiny Deck):**
```css
@keyframes cardFlip {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
}

.card-flip {
  animation: cardFlip 0.6s ease-in-out;
}
```

**Pulse (Energy low warning):**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## LAYOUT GRID

### Container

**Max Width:**
- Desktop: `1200px`
- Centered with auto margins
- Padding: `24px` (mobile), `48px` (desktop)

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

@media (min-width: 768px) {
  .container {
    padding: 0 var(--space-12);
  }
}
```

---

### Grid System (12-column)

**CSS Grid:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

.col-span-4 {
  grid-column: span 4;
}

.col-span-6 {
  grid-column: span 6;
}

.col-span-12 {
  grid-column: span 12;
}
```

**Responsive:**
```css
@media (max-width: 768px) {
  .col-span-4,
  .col-span-6 {
    grid-column: span 12; /* Full width on mobile */
  }
}
```

---

## DESIGN TOKENS

### CSS Custom Properties (Variables)

**`styles/tokens.css`:**

```css
:root {
  /* Colors */
  --color-frontier-red: #C44536;
  --color-frontier-red-light: #D6655A;
  --color-frontier-red-dark: #9D3529;

  --color-dust-gold: #D4A574;
  --color-dust-gold-light: #E6C59B;
  --color-dust-gold-dark: #B8895F;

  --color-leather-brown: #5C4033;
  --color-leather-brown-light: #7A5447;
  --color-leather-brown-dark: #3D2921;

  /* Semantic Colors */
  --color-success: #5A8F5A;
  --color-warning: #D49A3C;
  --color-danger: #C44536;
  --color-info: #5A7FA5;

  /* Grays */
  --color-gray-lightest: #F5F1EC;
  --color-gray-light: #E6DFD8;
  --color-gray-medium: #C9BFB5;
  --color-gray-dark: #8C8379;
  --color-gray-darkest: #3D3833;

  /* Text */
  --color-text-primary: #2D2926;
  --color-text-secondary: #6B635C;
  --color-text-disabled: #A39C94;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Typography */
  --font-heading: 'Rye', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-base: 1rem;
  --font-lg: 1.125rem;
  --font-xl: 1.25rem;
  --font-2xl: 1.5rem;
  --font-3xl: 1.875rem;
  --font-4xl: 2.25rem;

  /* Transitions */
  --transition-fast: 0.15s;
  --transition-base: 0.3s;
  --transition-slow: 0.5s;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(45, 41, 38, 0.05);
  --shadow-base: 0 2px 8px rgba(45, 41, 38, 0.1);
  --shadow-lg: 0 4px 12px rgba(45, 41, 38, 0.15);
  --shadow-xl: 0 8px 24px rgba(45, 41, 38, 0.2);
}
```

---

## IMPLEMENTATION GUIDELINES

### TailwindCSS Configuration

**`tailwind.config.js`:**

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        frontier: {
          red: '#C44536',
          'red-light': '#D6655A',
          'red-dark': '#9D3529',
        },
        dust: {
          gold: '#D4A574',
          'gold-light': '#E6C59B',
          'gold-dark': '#B8895F',
        },
        leather: {
          brown: '#5C4033',
          'brown-light': '#7A5447',
          'brown-dark': '#3D2921',
        },
        settler: '#4A6FA5',
        nahi: '#8B6F47',
        frontera: '#8C3F2F',
      },
      fontFamily: {
        heading: ['Rye', 'Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
}
```

**Usage:**
```jsx
<button className="bg-frontier-red hover:bg-frontier-red-light text-white px-6 py-3 rounded">
  Duel
</button>
```

---

### Component Library Structure

**Directory:**
```
src/
└── components/
    ├── common/
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   ├── Input.tsx
    │   ├── Badge.tsx
    │   ├── ProgressBar.tsx
    │   └── Modal.tsx
    ├── game/
    │   ├── EnergyDisplay.tsx
    │   ├── GoldDisplay.tsx
    │   ├── CharacterCard.tsx
    │   ├── DestinyDeckAnimation.tsx
    │   └── SkillCard.tsx
    ├── layout/
    │   ├── Header.tsx
    │   ├── Sidebar.tsx
    │   ├── Footer.tsx
    │   └── Container.tsx
    └── index.ts  // Export all components
```

**Example Component (`Button.tsx`):**

```tsx
import React from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick
}) => {
  const baseClasses = 'font-semibold uppercase tracking-wide rounded transition-all duration-200'

  const variantClasses = {
    primary: 'bg-frontier-red hover:bg-frontier-red-light text-white',
    secondary: 'bg-dust-gold hover:bg-dust-gold-light text-leather-brown-dark',
    tertiary: 'border-2 border-leather-brown text-leather-brown hover:bg-leather-brown hover:text-white'
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

**Usage:**
```tsx
import { Button } from '@/components'

<Button variant="primary" size="lg" onClick={handleDuel}>
  Challenge to Duel
</Button>
```

---

### Storybook Integration

**Install Storybook:**
```bash
npx storybook init
```

**Component Story (`Button.stories.tsx`):**
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}
```

**Run Storybook:**
```bash
npm run storybook
```

---

## CONCLUSION

This Design System provides **complete visual consistency** with:

- **Color Palette:** 50+ colors with semantic meanings (hex codes defined)
- **Typography:** 3 font families, 8 size scales, clear hierarchy
- **Spacing:** 8px-based scale for consistent spacing
- **Components:** 15+ reusable components (buttons, cards, inputs, badges, etc.)
- **Icons:** Lucide icon library with consistent style
- **Animations:** Smooth transitions and playful effects
- **Layout Grid:** 12-column responsive grid system
- **Design Tokens:** CSS variables for easy theming

Developers can now build **consistent, beautiful UI** with predefined, reusable components.

---

**Document Status:** ✅ Complete
**Components Defined:** 15+ core components
**Design Tokens:** Fully specified
**Ready for Implementation:** Yes

*— Ezra "Hawk" Hawthorne*
*Design System Architect*
*November 15, 2025*
