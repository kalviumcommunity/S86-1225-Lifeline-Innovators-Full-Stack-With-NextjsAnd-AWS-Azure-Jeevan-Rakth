# Quick Reference - User Feedback System

## 🚀 Quick Start

### 1. Import What You Need
```tsx
import { useToast } from '@/hooks/useToast';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Modal, ButtonLoader, ProgressBar, Spinner } from '@/components';
```

### 2. Use in Component
```tsx
const MyComponent = () => {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button onClick={() => toast.success('Done!')}>
        Show Toast
      </button>
      <ConfirmDialog />
    </>
  );
};
```

---

## 📋 Cheat Sheet

### Toast Notifications

```tsx
const toast = useToast();

// Success (green)
toast.success('Saved successfully!');

// Error (red)
toast.error('Failed to save');

// Warning (yellow)
toast.warning('Please review');

// Info (blue)
toast.info('New update available');

// Loading
const id = toast.loading('Processing...');
toast.dismiss(id);

// With description
toast.success('Title', {
  description: 'More details here',
  duration: 4000,
});

// With action button
toast.info('Item deleted', {
  action: {
    label: 'Undo',
    onClick: () => restoreItem(),
  },
});

// Promise-based
toast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed!',
});
```

### Confirmation Modal

```tsx
const { confirm, ConfirmDialog } = useConfirmDialog();

// Basic confirmation
const confirmed = await confirm({
  title: 'Confirm Action',
  message: 'Are you sure?',
});

if (confirmed) {
  // Do action
}

// With variant
await confirm({
  title: 'Delete Item',
  message: 'This cannot be undone',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'danger', // 'default' | 'danger' | 'warning' | 'success'
});

// Don't forget to render
<ConfirmDialog />
```

### Button Loader

```tsx
const [loading, setLoading] = useState(false);

<ButtonLoader
  isLoading={loading}
  onClick={handleSubmit}
  loadingText="Submitting..."
  variant="primary" // 'primary' | 'secondary' | 'danger'
>
  Submit
</ButtonLoader>
```

### Progress Bar

```tsx
const [progress, setProgress] = useState(0);

<ProgressBar 
  progress={progress} 
  label="Upload Progress"
  showPercentage={true}
  variant="default" // 'default' | 'success' | 'warning' | 'error'
/>
```

### Spinner

```tsx
<Spinner 
  size="md" // 'sm' | 'md' | 'lg' | 'xl'
  color="primary" // 'primary' | 'white' | 'gray'
  label="Loading..."
/>
```

### Loading Overlay

```tsx
const [isLoading, setIsLoading] = useState(false);

<LoadingOverlay 
  isVisible={isLoading}
  message="Please wait..."
/>
```

### Skeleton Loader

```tsx
{isLoading ? (
  <SkeletonLoader lines={5} />
) : (
  <ActualContent />
)}
```

---

## 🎯 Common Patterns

### Login/Signup
```tsx
const handleLogin = async () => {
  setLoading(true);
  try {
    await login();
    toast.success('Login successful!');
    router.push('/dashboard');
  } catch (err) {
    toast.error('Login failed', {
      description: 'Invalid credentials',
    });
  } finally {
    setLoading(false);
  }
};
```

### Delete with Confirmation
```tsx
const handleDelete = async (id: string) => {
  const confirmed = await confirm({
    title: 'Delete Item',
    message: 'This cannot be undone',
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await deleteItem(id);
    toast.success('Deleted successfully!');
  } catch (err) {
    toast.error('Failed to delete');
  }
};
```

### File Upload
```tsx
const handleUpload = async (file: File) => {
  setProgress(0);
  
  toast.promise(
    uploadWithProgress(file, setProgress),
    {
      loading: 'Uploading...',
      success: 'Upload complete!',
      error: 'Upload failed',
    }
  );
};
```

### Form Submission
```tsx
const onSubmit = async (data) => {
  const toastId = toast.loading('Saving...');
  
  try {
    await saveData(data);
    toast.dismiss(toastId);
    toast.success('Saved successfully!');
  } catch (err) {
    toast.dismiss(toastId);
    toast.error('Failed to save');
  }
};
```

---

## 🎨 Color Coding

| Type | Color | When to Use |
|------|-------|-------------|
| Success | Green | Completed actions |
| Error | Red | Failed operations |
| Warning | Yellow | Important notices |
| Info | Blue | General information |
| Default | Gray/Blue | Normal actions |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| TAB | Move focus forward |
| SHIFT+TAB | Move focus backward |
| ESC | Close modal |
| ENTER | Confirm/Submit |
| SPACE | Activate button |

---

## 📏 Best Practices

### Do ✅
- Show immediate feedback
- Use appropriate variants
- Include descriptions
- Allow undo when possible
- Test keyboard navigation
- Consider screen readers

### Don't ❌
- Stack too many toasts
- Use modals for everything
- Block UI unnecessarily
- Ignore errors silently
- Skip loading states
- Forget accessibility

---

## 🔍 Troubleshooting

### Toast not showing?
- Check Toaster is in layout.tsx
- Verify import path
- Check toast is called

### Modal not closing?
- Ensure ConfirmDialog is rendered
- Check onClose is called
- Verify ESC key handler

### Focus trap not working?
- Modal must have focusable elements
- Check tabindex values
- Verify modal is open

### Button stays loading?
- Set loading to false in finally
- Check async function completes
- Verify state update

---

## 📦 Component Locations

```
src/
├── components/
│   ├── ui/
│   │   ├── Modal.tsx
│   │   └── Loader.tsx
│   └── index.ts
├── hooks/
│   ├── useToast.ts
│   └── useConfirmDialog.tsx
└── app/
    ├── layout.tsx (Toaster provider)
    └── feedback-demo/
        └── page.tsx (Demo)
```

---

## 🔗 Related Documentation

- [FEEDBACK_SYSTEM.md](./FEEDBACK_SYSTEM.md) - Complete guide
- [VISUAL_GUIDE.md](./VISUAL_GUIDE.md) - Screenshots/GIFs
- [README.md](./README.md) - Project overview

---

## 💡 Tips

1. **Use promise toasts** for async operations
2. **Add descriptions** for context
3. **Use confirmations** for destructive actions
4. **Show progress** for long operations
5. **Test accessibility** with keyboard
6. **Keep messages** clear and concise
7. **Use variants** consistently

---

## 🎬 Example: Complete Flow

```tsx
const handleCompleteAction = async () => {
  // 1. Confirm
  const confirmed = await confirm({
    title: 'Process Data',
    message: 'This will take a moment',
  });
  
  if (!confirmed) {
    toast.info('Cancelled');
    return;
  }

  // 2. Show loading
  setIsLoading(true);
  
  // 3. Process with progress
  for (let i = 0; i <= 100; i += 10) {
    setProgress(i);
    await delay(200);
  }

  // 4. Complete
  setIsLoading(false);
  toast.success('Complete!', {
    description: 'All data processed',
  });
};

return (
  <>
    <ButtonLoader
      isLoading={isLoading}
      onClick={handleCompleteAction}
    >
      Start Process
    </ButtonLoader>
    
    {progress > 0 && (
      <ProgressBar progress={progress} />
    )}
    
    <ConfirmDialog />
    <LoadingOverlay isVisible={isLoading} />
  </>
);
```

---

**Quick Reference v1.0** | Last Updated: Dec 29, 2025
