# React Performance Optimization Quick Reference

## When to Use React.memo

### ✅ Use React.memo when:
- Component renders often with same props
- Component is expensive to render (complex calculations, large lists)
- Component receives reference types as props (objects, arrays, functions)
- Parent re-renders frequently but child props rarely change

### ❌ Avoid React.memo when:
- Component props change on every render anyway
- Component is very simple (just JSX, no calculations)
- Component always renders with different props
- Premature optimization (measure first!)

---

## When to Use useMemo

### ✅ Use useMemo for:
- Expensive calculations (loops, filtering, sorting)
- Complex object/array transformations
- Derived values from props/state
- Values passed to dependency arrays

### ❌ Avoid useMemo for:
- Simple calculations (addition, string concatenation)
- Primitive values that change every render anyway
- Component return JSX (use React.memo instead)

**Example:**
```typescript
// ✅ Good - expensive calculation
const sortedItems = useMemo(
  () => items.sort((a, b) => a.priority - b.priority),
  [items]
);

// ❌ Bad - simple calculation
const total = useMemo(() => a + b, [a, b]); // Just do: const total = a + b;
```

---

## When to Use useCallback

### ✅ Use useCallback for:
- Functions passed as props to memoized children
- Functions used in dependency arrays
- Event handlers passed to optimized components
- Callbacks used in effects

### ❌ Avoid useCallback for:
- Functions only used within the component
- Event handlers on DOM elements (onClick on <button>)
- Functions that should recreate every render

**Example:**
```typescript
// ✅ Good - passed to memoized child
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

return <MemoizedChild onClick={handleClick} />;

// ❌ Bad - just a DOM event handler
const handleClick = useCallback(() => doSomething(), []); // Unnecessary
return <button onClick={handleClick}>Click</button>;
```

---

## Custom Comparison Functions

### When to use:
- Default shallow comparison isn't sufficient
- You know exactly which props matter
- Complex objects where only specific fields change

### Pattern:
```typescript
export const Component = React.memo(({ data, options }) => {
  // component logic
}, (prevProps, nextProps) => {
  // Return true to SKIP re-render
  // Return false to RE-RENDER
  return (
    prevProps.data.id === nextProps.data.id &&
    prevProps.options.enabled === nextProps.options.enabled
  );
});
```

**Important:** Return `true` means "props are equal, skip render"

---

## Optimized Components in Desperados Destiny

### Display Components (High Re-render Frequency)
| Component | File | Use Case |
|-----------|------|----------|
| GoldDisplay | `components/game/GoldDisplay.tsx` | Currency display |
| EnergyBar | `components/EnergyBar.tsx` | Energy visualization |
| EnergyDisplay | `components/game/EnergyDisplay.tsx` | Detailed energy status |

### Layout Components (Static)
| Component | File | Use Case |
|-----------|------|----------|
| Header | `components/layout/Header.tsx` | Main navigation |

### List Item Components (Render in Lists)
| Component | File | Use Case |
|-----------|------|----------|
| CharacterCard | `components/CharacterCard.tsx` | Character selection |
| NotificationItem | `components/notifications/NotificationItem.tsx` | Notification list items |

### Interactive Components (State Management)
| Component | File | Use Case |
|-----------|------|----------|
| NotificationBell | `components/notifications/NotificationBell.tsx` | Notification dropdown |

---

## Usage Examples

### GoldDisplay Component
```typescript
import { GoldDisplay } from '@/components/game/GoldDisplay';

// Simple usage
<GoldDisplay amount={character.gold} />

// With size variant
<GoldDisplay amount={1000000} size="lg" />

// Without icon
<GoldDisplay amount={500} showIcon={false} size="sm" />
```

### Memoized Event Handler
```typescript
import { useCallback } from 'react';

const MyComponent = ({ onSubmit, data }) => {
  // ✅ Stable reference across renders
  const handleSubmit = useCallback(() => {
    onSubmit(data.id);
  }, [onSubmit, data.id]);

  return <MemoizedForm onSubmit={handleSubmit} />;
};
```

### Memoized Calculation
```typescript
import { useMemo } from 'react';

const MyComponent = ({ items }) => {
  // ✅ Only recalculates when items change
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  return <div>Total: {total}</div>;
};
```

---

## Common Patterns

### 1. Memoized List Items
```typescript
const MyList = ({ items }) => {
  return (
    <div>
      {items.map(item => (
        <MemoizedListItem key={item.id} item={item} />
      ))}
    </div>
  );
};

const ListItem = React.memo(({ item }) => {
  return <div>{item.name}</div>;
});
```

### 2. Stable Callbacks in Lists
```typescript
const MyList = ({ items, onDelete }) => {
  // ❌ Bad - creates new function on every render
  return items.map(item => (
    <Item key={item.id} onDelete={() => onDelete(item.id)} />
  ));

  // ✅ Good - stable callback per item
  const handleDelete = useCallback((id) => {
    onDelete(id);
  }, [onDelete]);

  return items.map(item => (
    <MemoizedItem key={item.id} id={item.id} onDelete={handleDelete} />
  ));
};

const MemoizedItem = React.memo(({ id, onDelete }) => {
  const handleClick = useCallback(() => {
    onDelete(id);
  }, [id, onDelete]);

  return <button onClick={handleClick}>Delete</button>;
});
```

### 3. Memoized Derived State
```typescript
const CharacterStats = ({ character }) => {
  // ✅ Memoized calculations
  const totalStats = useMemo(() => {
    return character.stats.cunning +
           character.stats.spirit +
           character.stats.combat +
           character.stats.craft;
  }, [character.stats]);

  const averageStat = useMemo(() => {
    return totalStats / 4;
  }, [totalStats]);

  return (
    <div>
      <div>Total: {totalStats}</div>
      <div>Average: {averageStat}</div>
    </div>
  );
};
```

---

## Debugging Performance

### React DevTools Profiler
1. Open React DevTools
2. Go to Profiler tab
3. Click record (⚫)
4. Perform action
5. Stop recording
6. Analyze render times and counts

### Check if memo is working:
```typescript
const MyComponent = React.memo(({ data }) => {
  console.log('MyComponent rendered');
  return <div>{data.value}</div>;
});

// Should only log when data.value changes
```

### Verify useCallback stability:
```typescript
const MyComponent = () => {
  const callback = useCallback(() => {
    console.log('callback');
  }, []);

  useEffect(() => {
    console.log('Callback changed'); // Should only log once
  }, [callback]);
};
```

---

## Performance Checklist

### Before Optimizing
- [ ] Measure actual performance issue
- [ ] Identify components with excessive renders
- [ ] Profile with React DevTools
- [ ] Verify props are causing re-renders

### While Optimizing
- [ ] Add React.memo to frequently rendering components
- [ ] Memoize expensive calculations with useMemo
- [ ] Stabilize callbacks with useCallback
- [ ] Add custom comparison if needed
- [ ] Test functionality still works

### After Optimizing
- [ ] Measure performance improvement
- [ ] Verify no visual regressions
- [ ] Check for memory leaks
- [ ] Document optimization decisions

---

## Anti-Patterns to Avoid

### ❌ Over-memoization
```typescript
// Bad - everything memoized for no reason
const MyComponent = () => {
  const name = useMemo(() => 'John', []); // ❌ Just use const name = 'John'
  const age = useMemo(() => 25, []); // ❌ Just use const age = 25
  const greeting = useMemo(() => `Hello ${name}`, [name]); // ❌ Simple string

  return <div>{greeting}</div>;
};
```

### ❌ Wrong dependencies
```typescript
// Bad - missing dependencies
const handleClick = useCallback(() => {
  doSomething(value); // ❌ value should be in deps
}, []);

// Good
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### ❌ Memoizing JSX
```typescript
// Bad - use React.memo instead
const MyComponent = () => {
  const jsx = useMemo(() => ( // ❌ Don't do this
    <div>Complex JSX</div>
  ), []);

  return jsx;
};

// Good
const ComplexComponent = React.memo(() => (
  <div>Complex JSX</div>
));
```

---

## When NOT to Optimize

1. **Premature optimization** - Optimize when you have a measured problem
2. **Simple components** - <10 lines of JSX with no calculations
3. **Leaf components** - Components that don't render children
4. **Props always change** - If props change every render, memo won't help
5. **Development** - Optimize in production builds, profile both

---

## Measuring Success

### Metrics to Track
- **Render count** - Reduced by 60-85% for optimized components
- **Render time** - Faster updates during state changes
- **CPU usage** - Lower during idle periods
- **Memory** - Stable (not increasing)
- **FPS** - Smooth 60fps during animations

### Tools
- React DevTools Profiler
- Chrome Performance Tab
- Lighthouse Performance Audit
- Custom performance marks

---

## Resources

- [React.memo Documentation](https://react.dev/reference/react/memo)
- [useMemo Documentation](https://react.dev/reference/react/useMemo)
- [useCallback Documentation](https://react.dev/reference/react/useCallback)
- [Desperados Destiny Optimization Report](./REACT_MEMO_OPTIMIZATION_REPORT.md)

---

**Last Updated:** 2025-11-25
**Version:** 1.0
**Maintainer:** Development Team
