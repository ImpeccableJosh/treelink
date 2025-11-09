# Design System
## Treelink - Mint Green Theme

---

## Color Palette

### Primary Colors (Mint Green)
```css
--mint-primary: #4ECDC4;      /* Primary actions, CTAs, links */
--mint-primary-hover: #3AB5AD; /* Hover state */
--mint-primary-active: #2A9D8F; /* Active/pressed state */

--mint-secondary: #95E1D3;    /* Secondary buttons, accents */
--mint-light: #A8E6CF;        /* Light backgrounds, subtle highlights */
--mint-dark: #2A9D8F;         /* Dark text on mint, emphasis */
```

### Neutral Colors
```css
--white: #FFFFFF;
--gray-50: #FAFAFA;   /* Page backgrounds */
--gray-100: #F5F5F5;  /* Card backgrounds, subtle borders */
--gray-200: #E5E5E5;  /* Borders, dividers */
--gray-300: #D4D4D4;  /* Disabled states */
--gray-400: #A3A3A3;  /* Placeholder text */
--gray-500: #737373;  /* Secondary text */
--gray-600: #525252;  /* Body text */
--gray-700: #404040;  /* Headings */
--gray-800: #262626;  /* Strong emphasis */
--gray-900: #171717;  /* Maximum contrast */
```

### Semantic Colors
```css
--success: #10B981;   /* Success messages, completed states */
--error: #EF4444;     /* Errors, destructive actions */
--warning: #F59E0B;   /* Warnings, pending states */
--info: #3B82F6;      /* Informational messages */
```

### Usage Guidelines
- **Primary Actions:** Use `--mint-primary` for main CTAs (buttons, links)
- **Backgrounds:** Use `--white` for cards, `--gray-50` for page backgrounds
- **Text:** Use `--gray-700` for headings, `--gray-600` for body text
- **Borders:** Use `--gray-200` for subtle borders, `--mint-light` for mint accents
- **Success States:** Use `--success` for completed applications, successful actions
- **Error States:** Use `--error` for errors, failed validations

---

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px - Labels, captions */
--text-sm: 0.875rem;   /* 14px - Small text, metadata */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;    /* 18px - Large body */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - Section headings */
--text-3xl: 1.875rem;  /* 30px - Page titles */
--text-4xl: 2.25rem;   /* 36px - Hero titles */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## Spacing System

### Scale (8px base)
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Usage
- **Card padding:** `--space-6` (24px)
- **Section spacing:** `--space-8` to `--space-12`
- **Component gaps:** `--space-4` to `--space-6`
- **Button padding:** `--space-3` vertical, `--space-6` horizontal

---

## Components

### Buttons

#### Primary Button
```css
.btn-primary {
  background-color: var(--mint-primary);
  color: var(--white);
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: var(--mint-primary-hover);
}

.btn-primary:active {
  background-color: var(--mint-primary-active);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: var(--white);
  color: var(--mint-primary);
  border: 2px solid var(--mint-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
}

.btn-secondary:hover {
  background-color: var(--mint-light);
}
```

#### Ghost Button
```css
.btn-ghost {
  background-color: transparent;
  color: var(--mint-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
}

.btn-ghost:hover {
  background-color: var(--gray-100);
}
```

### Cards

#### Standard Card
```css
.card {
  background-color: var(--white);
  border-radius: 1rem;
  padding: var(--space-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
}
```

#### Elevated Card
```css
.card-elevated {
  background-color: var(--white);
  border-radius: 1rem;
  padding: var(--space-6);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--gray-200);
  border-radius: 0.5rem;
  font-size: var(--text-base);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--mint-primary);
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
}
```

### Social Link Buttons

#### Social Link (Card Page)
```css
.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  background-color: var(--white);
  border: 2px solid var(--mint-primary);
  border-radius: 0.75rem;
  color: var(--mint-primary);
  font-weight: var(--font-medium);
  transition: all 0.2s;
  text-decoration: none;
}

.social-link:hover {
  background-color: var(--mint-primary);
  color: var(--white);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}
```

---

## Layout Patterns

### Public Card Page
```css
.card-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, var(--mint-light), var(--white));
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-6);
}

.card-container {
  width: 100%;
  max-width: 600px;
  background-color: var(--white);
  border-radius: 1.5rem;
  padding: var(--space-8);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}
```

### Dashboard Layout
```css
.dashboard-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
  background-color: var(--gray-50);
}

.dashboard-sidebar {
  background-color: var(--white);
  border-right: 1px solid var(--gray-200);
  padding: var(--space-6);
}

.dashboard-main {
  padding: var(--space-8);
}
```

### Organization Dashboard
```css
.org-dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--gray-50);
}

.org-header {
  background-color: var(--white);
  border-bottom: 1px solid var(--gray-200);
  padding: var(--space-6);
}

.org-content {
  display: grid;
  grid-template-columns: 200px 1fr;
  flex: 1;
}
```

---

## Responsive Breakpoints

```css
/* Mobile First */
/* Base: 0px - 767px (mobile) */

/* Tablet */
@media (min-width: 768px) {
  .card-container {
    padding: var(--space-10);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard-layout {
    grid-template-columns: 280px 1fr;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## Icons

### Icon Library
Use **Lucide React** for consistent iconography:
```bash
npm install lucide-react
```

### Icon Sizes
```css
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 32px;
```

### Icon Colors
- **Default:** `var(--gray-600)`
- **Primary:** `var(--mint-primary)`
- **Success:** `var(--success)`
- **Error:** `var(--error)`

---

## Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
--shadow-mint: 0 4px 12px rgba(78, 205, 196, 0.3);
```

---

## Animations

### Transitions
```css
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;
```

### Hover Effects
- **Buttons:** Slight scale (1.02) or translateY(-2px)
- **Cards:** Subtle shadow increase
- **Links:** Underline or color change

---

## Accessibility

### Focus States
```css
.focus-ring {
  outline: 2px solid var(--mint-primary);
  outline-offset: 2px;
}
```

### Color Contrast
- Text on white: Minimum 4.5:1 ratio
- Text on mint: Use `--mint-dark` or `--white` for sufficient contrast
- Interactive elements: Clear hover/active states

### Screen Reader Support
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Include `aria-label` for icon-only buttons
- Provide `alt` text for images

---

## Implementation in Tailwind

### Tailwind Config Extension
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        mint: {
          primary: '#4ECDC4',
          'primary-hover': '#3AB5AD',
          'primary-active': '#2A9D8F',
          secondary: '#95E1D3',
          light: '#A8E6CF',
          dark: '#2A9D8F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

### Usage in Components
```tsx
<button className="bg-mint-primary hover:bg-mint-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors">
  Primary Button
</button>
```

---

## Example Component Styles

### Public Card Avatar
```css
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--mint-primary);
  object-fit: cover;
}
```

### Status Badge
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: 9999px;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.badge-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.badge-pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}
```

---

## Design Principles

1. **Clean & Minimal:** White backgrounds with mint accents
2. **Consistent Spacing:** 8px base unit throughout
3. **Clear Hierarchy:** Use size, weight, and color to establish importance
4. **Accessible:** Meet WCAG 2.1 AA standards
5. **Mobile-First:** Design for small screens, enhance for larger
6. **Delightful Interactions:** Subtle animations and hover states
7. **Professional:** Balance friendly (mint) with trustworthy (white/gray)

---

## Resources

- **Color Tool:** [Coolors.co](https://coolors.co) for palette variations
- **Contrast Checker:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Icons:** [Lucide Icons](https://lucide.dev)
- **Typography:** [Inter Font](https://rsms.me/inter/)

