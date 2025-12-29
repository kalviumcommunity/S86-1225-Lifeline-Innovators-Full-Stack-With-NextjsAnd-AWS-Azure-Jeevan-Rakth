# Tailwind CSS Quick Reference

## Custom Brand Colors

| Class | Hex | Usage |
|-------|-----|-------|
| `bg-brand-light` / `text-brand-light` | #93C5FD | Light accents, hover states |
| `bg-brand` / `text-brand` | #3B82F6 | Primary brand color |
| `bg-brand-dark` / `text-brand-dark` | #1E40AF | Dark emphasis, text |

## Responsive Breakpoints

| Prefix | Min Width | Device |
|--------|-----------|--------|
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets (portrait) |
| `lg:` | 1024px | Tablets (landscape), laptops |
| `xl:` | 1280px | Desktops, large screens |

## Dark Mode Classes

Apply dark mode styles using the `dark:` prefix:

```tsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">Themed text</p>
</div>
```

## Common Responsive Patterns

### Responsive Padding
```tsx
<div className="p-4 md:p-8 lg:p-12">
  {/* Padding scales with screen size */}
</div>
```

### Responsive Text
```tsx
<h1 className="text-lg md:text-2xl lg:text-3xl">
  {/* Text size scales with screen size */}
</h1>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column → 2 columns → 3 columns */}
</div>
```

### Responsive Flex
```tsx
<div className="flex flex-col md:flex-row gap-4">
  {/* Stack vertically on mobile, horizontally on tablet+ */}
</div>
```

## Theme Toggle Usage

```tsx
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function MyComponent() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

## Using Theme Context

```tsx
'use client';
import { useTheme } from '@/context/ThemeContext';

export default function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
    </div>
  );
}
```

## Demo Page

Visit `/theme-demo` to see:
- All responsive breakpoints in action
- Brand color palette
- Dark/light theme switching
- Accessibility features
- Typography scaling
- Layout examples

## Testing Responsive Design

1. Open Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Select device presets or enter custom dimensions
4. Test at: 375px (mobile), 768px (tablet), 1280px (desktop)

## Accessibility Guidelines

✅ Always ensure color contrast meets WCAG AA (4.5:1)  
✅ Use semantic HTML with proper heading hierarchy  
✅ Add ARIA labels for icon-only buttons  
✅ Test keyboard navigation (Tab, Enter, Space)  
✅ Verify screen reader compatibility  

## Common Pitfalls to Avoid

❌ Don't use arbitrary values when theme values exist  
❌ Don't mix inline styles with Tailwind classes  
❌ Don't forget to test dark mode for all components  
❌ Don't create excessive breakpoint variations  
❌ Don't use `!important` - use proper specificity  

## File Locations

- **Tailwind Config:** `src/app/globals.css` (CSS variables)
- **Theme Context:** `src/context/ThemeContext.tsx`
- **Theme Toggle:** `src/components/ui/ThemeToggle.tsx`
- **Demo Page:** `src/app/theme-demo/page.tsx`
- **Full Documentation:** `TAILWIND_RESPONSIVE_THEME.md`
