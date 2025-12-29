# Migration Guide - Adopting the Feedback System

This guide helps you update existing code to use the new feedback system.

## 🔄 Before & After Examples

### Example 1: Simple Alert to Toast

#### Before
```tsx
const handleSave = async () => {
  try {
    await saveData();
    alert('Saved successfully!');
  } catch (err) {
    alert('Error saving data');
  }
};
```

#### After
```tsx
import { useToast } from '@/hooks/useToast';

const handleSave = async () => {
  const toast = useToast();
  
  try {
    await saveData();
    toast.success('Saved successfully!', {
      description: 'Your changes have been saved.',
    });
  } catch (err) {
    toast.error('Error saving data', {
      description: 'Please try again later.',
    });
  }
};
```

---

### Example 2: Confirm to Modal

#### Before
```tsx
const handleDelete = async () => {
  if (confirm('Are you sure you want to delete?')) {
    await deleteItem();
  }
};
```

#### After
```tsx
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';

const { confirm, ConfirmDialog } = useConfirmDialog();
const toast = useToast();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete Item',
    message: 'This action cannot be undone. Are you sure?',
    confirmText: 'Delete',
    variant: 'danger',
  });

  if (confirmed) {
    try {
      await deleteItem();
      toast.success('Item deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete item');
    }
  }
};

// Don't forget to render
<ConfirmDialog />
```

---

### Example 3: Manual Loading State to ButtonLoader

#### Before
```tsx
const [loading, setLoading] = useState(false);

<button 
  disabled={loading}
  onClick={async () => {
    setLoading(true);
    await submit();
    setLoading(false);
  }}
>
  {loading ? 'Submitting...' : 'Submit'}
</button>
```

#### After
```tsx
import { ButtonLoader } from '@/components';

const [loading, setLoading] = useState(false);

<ButtonLoader
  isLoading={loading}
  onClick={async () => {
    setLoading(true);
    try {
      await submit();
      toast.success('Submitted!');
    } catch (err) {
      toast.error('Failed to submit');
    } finally {
      setLoading(false);
    }
  }}
  loadingText="Submitting..."
>
  Submit
</ButtonLoader>
```

---

### Example 4: Inline Error to Toast

#### Before
```tsx
const [error, setError] = useState('');

{error && (
  <div className="error-message">{error}</div>
)}

const handleAction = async () => {
  setError('');
  try {
    await doAction();
  } catch (err) {
    setError('Action failed');
  }
};
```

#### After
```tsx
import { useToast } from '@/hooks/useToast';

const toast = useToast();

const handleAction = async () => {
  try {
    await doAction();
    toast.success('Action completed!');
  } catch (err) {
    toast.error('Action failed', {
      description: 'Please try again later.',
    });
  }
};

// Remove error state and error display
```

---

## 📝 Step-by-Step Migration

### Step 1: Add Imports
Add at the top of your component file:
```tsx
import { useToast } from '@/hooks/useToast';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ButtonLoader } from '@/components';
```

### Step 2: Initialize Hooks
Inside your component:
```tsx
const toast = useToast();
const { confirm, ConfirmDialog } = useConfirmDialog();
```

### Step 3: Replace Alerts
Find all `alert()` calls and replace with appropriate toast:
```tsx
// alert('Success!');
toast.success('Success!');

// alert('Error!');
toast.error('Error!');
```

### Step 4: Replace Confirms
Find all `confirm()` calls and replace with modal:
```tsx
// if (confirm('Sure?')) { ... }
const confirmed = await confirm({
  title: 'Confirm',
  message: 'Sure?',
});
if (confirmed) { ... }
```

### Step 5: Update Loading States
Replace manual loading implementations with ButtonLoader.

### Step 6: Add ConfirmDialog
If using `useConfirmDialog`, add at the end of your component:
```tsx
return (
  <>
    {/* Your existing JSX */}
    <ConfirmDialog />
  </>
);
```

---

## 🎯 Common Patterns to Replace

### Pattern 1: Success/Error State
#### Before
```tsx
const [success, setSuccess] = useState(false);
const [error, setError] = useState('');

{success && <div className="success">Success!</div>}
{error && <div className="error">{error}</div>}
```

#### After
```tsx
// Remove state, just use toast
toast.success('Success!');
toast.error(error);
```

### Pattern 2: Loading Spinner in UI
#### Before
```tsx
{loading && <div className="spinner">Loading...</div>}
```

#### After
```tsx
<LoadingOverlay isVisible={loading} message="Loading..." />
// or
<Spinner size="md" />
```

### Pattern 3: Inline Validation Errors
#### Keep for field-level errors, but add toast for form-level:
```tsx
// Keep field errors
{errors.email && <span>Invalid email</span>}

// Add toast for submit
toast.error('Form validation failed', {
  description: 'Please fix the errors and try again.',
});
```

---

## ✅ Migration Checklist

For each component/page:

- [ ] Import required hooks/components
- [ ] Initialize hooks in component
- [ ] Replace all `alert()` calls
- [ ] Replace all `confirm()` calls
- [ ] Update loading states
- [ ] Replace error/success messages
- [ ] Add ConfirmDialog if using confirm
- [ ] Test keyboard navigation
- [ ] Test screen reader
- [ ] Remove unused error/success state

---

## 🚨 Breaking Changes

### None!
The feedback system is additive - it doesn't break existing code. You can migrate gradually.

### What to Keep
- Form field validation errors (inline)
- Complex error pages
- Existing error boundaries

### What to Replace
- `alert()` calls
- `confirm()` calls
- Manual loading indicators
- Success/error message state
- Simple modals

---

## 🎨 Style Consistency

### Old Inline Styles
```tsx
// Remove these
<div className="bg-green-100 text-green-700">Success</div>
<div className="bg-red-100 text-red-700">Error</div>
```

### New Toast System
```tsx
// Use these instead
toast.success('Success');
toast.error('Error');
```

---

## 📊 Priority Order

Migrate in this order for best impact:

1. **High Priority** (User-facing feedback)
   - Login/Signup forms
   - Delete actions
   - Save/Update operations

2. **Medium Priority** (Helpful but not critical)
   - Copy actions
   - Settings changes
   - Profile updates

3. **Low Priority** (Nice to have)
   - Info messages
   - Tips and hints
   - Non-critical notifications

---

## 🔍 Finding Code to Migrate

### Search for these patterns:
```bash
# Alert calls
grep -r "alert(" src/

# Confirm calls
grep -r "confirm(" src/

# Manual loading states
grep -r "isLoading" src/
grep -r "loading" src/

# Error messages
grep -r "setError" src/
grep -r "error &&" src/
```

---

## 🧪 Testing After Migration

### Functional Testing
- [ ] All toasts appear correctly
- [ ] Modals open/close properly
- [ ] Loading states work
- [ ] No console errors

### Accessibility Testing
- [ ] Tab through all interactive elements
- [ ] ESC closes modals
- [ ] Screen reader announces toasts
- [ ] Focus visible on all elements

### Cross-browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## 💡 Tips for Team

1. **Migrate gradually** - One component at a time
2. **Test thoroughly** - Especially accessibility
3. **Update documentation** - Note what's been migrated
4. **Share patterns** - Help team members
5. **Code review** - Ensure consistency

---

## 🆘 Common Issues

### Toast doesn't show
**Problem:** Toaster not in layout  
**Solution:** Verify `<Toaster />` in layout.tsx

### Modal doesn't open
**Problem:** ConfirmDialog not rendered  
**Solution:** Add `<ConfirmDialog />` to JSX

### Loading state stuck
**Problem:** Missing finally block  
**Solution:** Always use try/catch/finally

### Focus not trapped
**Problem:** No focusable elements in modal  
**Solution:** Ensure modal has buttons/inputs

---

## 📚 Resources

- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick syntax
- [FEEDBACK_SYSTEM.md](./FEEDBACK_SYSTEM.md) - Full documentation
- [Demo Page](http://localhost:3000/feedback-demo) - Live examples

---

## 🎯 Success Criteria

Your migration is complete when:
- ✅ No more `alert()` or `confirm()` calls
- ✅ Consistent feedback patterns
- ✅ All actions have feedback
- ✅ Accessibility tested
- ✅ Team trained on new system

---

## 📞 Support

Having issues? Check:
1. **Quick Reference** for syntax
2. **Full Documentation** for detailed info
3. **Demo Page** for working examples
4. **This Guide** for migration help

---

**Happy Migrating!** 🚀

Remember: You don't have to migrate everything at once. Start with high-priority user actions and work your way through the codebase gradually.
