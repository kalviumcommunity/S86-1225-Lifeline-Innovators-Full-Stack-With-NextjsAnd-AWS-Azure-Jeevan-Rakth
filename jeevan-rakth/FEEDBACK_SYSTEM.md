# User Feedback System Documentation

## Overview

This application implements a comprehensive user feedback system with three main patterns:

1. **Toast Notifications** - Instant, non-intrusive feedback
2. **Modals/Dialogs** - Blocking feedback that requires user attention
3. **Loaders/Progress Indicators** - Process feedback for async operations

All components follow accessibility best practices (WCAG 2.1) and provide excellent user experience.

---

## 📋 Table of Contents

- [Toast Notifications](#toast-notifications)
- [Modals & Dialogs](#modals--dialogs)
- [Loaders & Progress](#loaders--progress)
- [Accessibility Features](#accessibility-features)
- [UX Principles](#ux-principles)
- [Usage Examples](#usage-examples)
- [Demo Page](#demo-page)

---

## 🍞 Toast Notifications

### Purpose
Provide instant, non-blocking feedback for user actions like saves, deletes, errors, and confirmations.

### Library Used
**Sonner** - A modern, accessible toast library for React

### Features
- ✅ Auto-dismiss after configurable duration
- ✅ Multiple variants (success, error, warning, info, loading)
- ✅ Action buttons for undo/retry
- ✅ Promise-based toasts for async operations
- ✅ Screen reader announcements via `aria-live`
- ✅ Rich colors and icons
- ✅ Positioned at top-right by default

### Usage

```tsx
import { useToast } from '@/hooks/useToast';

const Component = () => {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Data saved successfully!', {
        description: 'Your changes have been saved.',
      });
    } catch (err) {
      toast.error('Save failed', {
        description: 'Please try again later.',
      });
    }
  };

  return <button onClick={handleSave}>Save</button>;
};
```

### Available Toast Types

#### 1. Success Toast
```tsx
toast.success('Operation completed!', {
  description: 'Your data has been saved.',
  duration: 4000, // optional
});
```
**Use for:** Successful operations, confirmations, completed tasks

#### 2. Error Toast
```tsx
toast.error('Something went wrong!', {
  description: 'Please try again later.',
  duration: 5000,
});
```
**Use for:** Failed operations, validation errors, network issues

#### 3. Warning Toast
```tsx
toast.warning('Warning message', {
  description: 'Please review before proceeding.',
});
```
**Use for:** Important notices, potential issues, cautionary messages

#### 4. Info Toast
```tsx
toast.info('New feature available!', {
  description: 'Check out our latest updates.',
});
```
**Use for:** General information, tips, announcements

#### 5. Loading Toast
```tsx
const toastId = toast.loading('Processing...');
// Later dismiss or update
toast.dismiss(toastId);
toast.success('Done!');
```
**Use for:** Long-running operations, file uploads, API calls

#### 6. Promise Toast
```tsx
toast.promise(asyncOperation, {
  loading: 'Uploading...',
  success: 'Upload complete!',
  error: 'Upload failed!',
});
```
**Use for:** Async operations with automatic state management

#### 7. Toast with Action
```tsx
toast.info('Item deleted', {
  action: {
    label: 'Undo',
    onClick: () => restoreItem(),
  },
});
```
**Use for:** Reversible actions, quick actions

### Pre-configured Common Toasts

```tsx
import { commonToasts } from '@/hooks/useToast';

// Quick shortcuts
commonToasts.saveSuccess();
commonToasts.saveError();
commonToasts.deleteSuccess('User');
commonToasts.copySuccess();
commonToasts.validationError('Invalid email format');
commonToasts.networkError();
commonToasts.unauthorized();
```

---

## 🪟 Modals & Dialogs

### Purpose
Provide blocking feedback that requires user attention and action before continuing.

### Features
- ✅ Focus trap - keyboard navigation stays within modal
- ✅ ESC key closes modal
- ✅ Click outside to close
- ✅ Semantic HTML with proper ARIA attributes
- ✅ Focus restoration after close
- ✅ Background scroll prevention
- ✅ Customizable variants (default, danger, warning, success)

### Usage

#### Option 1: Direct Modal Component

```tsx
import { Modal } from '@/components';
import { useState } from 'react';

const Component = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        onConfirm={() => {
          // Handle confirmation
          setIsOpen(false);
        }}
        confirmText="Confirm"
        cancelText="Cancel"
        variant="danger"
      >
        <p>Are you sure you want to proceed?</p>
      </Modal>
    </>
  );
};
```

#### Option 2: useConfirmDialog Hook (Recommended)

```tsx
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const Component = () => {
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'This action cannot be undone. Continue?',
      confirmText: 'Delete',
      variant: 'danger',
    });

    if (confirmed) {
      // Perform delete
      await deleteItem();
      toast.success('Item deleted!');
    }
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <ConfirmDialog />
    </>
  );
};
```

### Modal Variants

- **default** - Blue, for general confirmations
- **danger** - Red, for destructive actions (delete, remove)
- **warning** - Yellow, for caution-requiring actions
- **success** - Green, for positive confirmations

### Accessibility Features

- `role="dialog"` and `aria-modal="true"` for screen readers
- `aria-labelledby` pointing to modal title
- Focus trap keeps keyboard users inside modal
- ESC key support for quick closing
- Focus restoration to previous element after close
- Background overlay prevents interaction with underlying content

---

## ⏳ Loaders & Progress

### Purpose
Show progress and keep users informed during async operations.

### Components Available

#### 1. Spinner
Basic circular loading indicator

```tsx
import { Spinner } from '@/components';

<Spinner size="sm" color="primary" label="Loading..." />
<Spinner size="md" />
<Spinner size="lg" />
<Spinner size="xl" />
```

**Sizes:** sm, md, lg, xl  
**Colors:** primary, white, gray

#### 2. ButtonLoader
Button with integrated loading state

```tsx
import { ButtonLoader } from '@/components';

const [isLoading, setIsLoading] = useState(false);

<ButtonLoader
  isLoading={isLoading}
  onClick={handleSubmit}
  loadingText="Submitting..."
  variant="primary"
>
  Submit Form
</ButtonLoader>
```

**Use for:** Form submissions, async button actions

#### 3. LoadingOverlay
Full-screen blocking loader

```tsx
import { LoadingOverlay } from '@/components';

<LoadingOverlay 
  isVisible={isLoading} 
  message="Processing your request..." 
/>
```

**Use for:** Page transitions, major data loading, app initialization

#### 4. InlineLoader
Small inline loading indicator

```tsx
import { InlineLoader } from '@/components';

<InlineLoader text="Loading data..." size="sm" />
```

**Use for:** Inline content loading, small sections

#### 5. ProgressBar
Linear progress indicator with percentage

```tsx
import { ProgressBar } from '@/components';

<ProgressBar 
  progress={uploadProgress} 
  label="File Upload"
  showPercentage={true}
  variant="default"
/>
```

**Use for:** File uploads, multi-step processes, measurable progress

**Variants:** default, success, warning, error

#### 6. SkeletonLoader
Content placeholder

```tsx
import { SkeletonLoader } from '@/components';

{isLoading ? (
  <SkeletonLoader lines={5} />
) : (
  <ActualContent />
)}
```

**Use for:** Content placeholders, perceived performance improvement

### Accessibility

All loaders include:
- `role="status"` for screen reader announcements
- `aria-live="polite"` for non-intrusive updates
- `aria-label` for context
- Visible text alternatives via `sr-only` class

---

## ♿ Accessibility Features

All feedback components follow WCAG 2.1 Level AA standards:

### Toast Notifications
- `role="status"` with `aria-live="polite"`
- Auto-dismiss doesn't interrupt user flow
- Keyboard accessible close button
- Color contrast ratios meet standards

### Modals
- Focus trap implementation
- ESC key support
- Focus restoration
- `aria-modal="true"` and `role="dialog"`
- Proper heading structure with `aria-labelledby`

### Loaders
- Screen reader announcements
- Semantic HTML
- Non-flashy animations (no seizure triggers)
- Visible loading states

---

## 🎨 UX Principles Applied

### 1. Non-Intrusive
- Toasts don't block user actions
- Auto-dismiss prevents clutter
- Positioned to not cover important content

### 2. Informative
- Clear messages explain what happened
- Descriptions provide context
- Error messages suggest solutions

### 3. Consistent
- **Green** = Success
- **Red** = Error/Danger
- **Yellow** = Warning
- **Blue** = Info/Default
- Consistent positioning and timing

### 4. Smooth Animations
- Natural transitions (300ms)
- Fade in/out effects
- No jarring or flashy movements

### 5. User Trust
- Immediate feedback builds confidence
- Progress visibility reduces anxiety
- Clear communication maintains transparency

### 6. Reversible Actions
- Action buttons in toasts (undo, retry)
- Confirmation dialogs prevent mistakes
- Optimistic UI with rollback capability

---

## 💡 Usage Examples

### Example 1: Login Flow
```tsx
const handleLogin = async (email: string, password: string) => {
  setLoading(true);
  
  try {
    const success = await login(email, password);
    
    if (success) {
      toast.success('Login successful!', {
        description: 'Redirecting to dashboard...',
      });
      router.push('/dashboard');
    } else {
      toast.error('Login failed', {
        description: 'Invalid email or password.',
      });
    }
  } catch (err) {
    toast.error('Network error', {
      description: 'Please check your connection.',
    });
  } finally {
    setLoading(false);
  }
};
```

### Example 2: Delete with Confirmation
```tsx
const handleDelete = async (id: string) => {
  const confirmed = await confirm({
    title: 'Delete User',
    message: 'This action cannot be undone. Continue?',
    confirmText: 'Delete',
    variant: 'danger',
  });

  if (!confirmed) {
    toast.info('Delete cancelled');
    return;
  }

  try {
    await deleteUser(id);
    toast.success('User deleted successfully!');
  } catch (err) {
    toast.error('Failed to delete user');
  }
};
```

### Example 3: File Upload with Progress
```tsx
const handleUpload = async (file: File) => {
  setProgress(0);
  
  const uploadPromise = uploadFile(file, (percent) => {
    setProgress(percent);
  });

  toast.promise(uploadPromise, {
    loading: 'Uploading file...',
    success: 'File uploaded successfully!',
    error: 'Upload failed. Please try again.',
  });
};
```

### Example 4: Complete Feedback Flow
```tsx
const handleCompleteFlow = async () => {
  // Step 1: Confirmation
  const confirmed = await confirm({
    title: 'Start Process',
    message: 'This will process all records. Continue?',
  });

  if (!confirmed) return;

  // Step 2: Loading overlay
  setIsLoading(true);
  
  // Step 3: Progress
  for (let i = 0; i <= 100; i += 10) {
    setProgress(i);
    await delay(200);
  }

  setIsLoading(false);

  // Step 4: Success toast
  toast.success('Process completed!', {
    description: 'All records processed successfully.',
  });
};
```

---

## 🎬 Demo Page

Visit `/feedback-demo` to see all feedback components in action!

The demo page showcases:
- All toast notification types
- Different modal variants
- Various loader components
- Complete user feedback flows
- UX principles in practice

**Access the demo:** [http://localhost:3000/feedback-demo](http://localhost:3000/feedback-demo)

---

## 📊 Feedback Component Comparison

| Component | Type | Blocking | Auto-Dismiss | Use Case |
|-----------|------|----------|--------------|----------|
| Toast | Instant | No | Yes | Quick feedback |
| Modal | Blocking | Yes | No | Confirmations |
| LoadingOverlay | Process | Yes | No | Page loads |
| ButtonLoader | Process | Partial | No | Form submits |
| ProgressBar | Process | No | No | File uploads |
| Spinner | Process | No | No | Inline loading |

---

## 🚀 Quick Start

### 1. Import what you need
```tsx
import { useToast } from '@/hooks/useToast';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Modal, ButtonLoader, ProgressBar } from '@/components';
```

### 2. Use in your component
```tsx
const MyComponent = () => {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleAction = async () => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure?',
    });

    if (confirmed) {
      toast.success('Action completed!');
    }
  };

  return (
    <>
      <button onClick={handleAction}>Do Action</button>
      <ConfirmDialog />
    </>
  );
};
```

---

## 🎯 Best Practices

### When to Use Toasts
✅ Save/update confirmations  
✅ Form submission results  
✅ Copy to clipboard  
✅ Network errors  
✅ Quick notifications  

❌ Critical errors requiring action  
❌ Complex multi-step processes  
❌ Long-form content  

### When to Use Modals
✅ Destructive actions (delete, remove)  
✅ Important confirmations  
✅ Multi-step forms  
✅ Critical warnings  

❌ Simple notifications  
❌ Non-critical information  
❌ Frequent interruptions  

### When to Use Loaders
✅ Data fetching  
✅ File uploads  
✅ Form submissions  
✅ Page transitions  
✅ Background processing  

❌ Instant operations  
❌ Cached data  
❌ Optimistic updates  

---

## 🎨 Styling Customization

All components use Tailwind CSS and can be customized:

```tsx
// Custom button loader
<ButtonLoader
  className="bg-purple-600 hover:bg-purple-700 rounded-full"
  isLoading={loading}
>
  Custom Button
</ButtonLoader>

// Custom progress bar
<ProgressBar
  progress={50}
  variant="success"
  label="Custom Progress"
/>
```

---

## 📝 Component API Reference

### useToast()
Returns object with methods:
- `success(message, options?)` - Show success toast
- `error(message, options?)` - Show error toast
- `warning(message, options?)` - Show warning toast
- `info(message, options?)` - Show info toast
- `loading(message, options?)` - Show loading toast
- `promise(promise, messages)` - Toast for async operations
- `dismiss(id?)` - Dismiss specific or all toasts

### useConfirmDialog()
Returns object with:
- `confirm(options)` - Promise that resolves to boolean
- `ConfirmDialog` - Component to render

### Modal Props
- `isOpen: boolean` - Control visibility
- `onClose: () => void` - Close handler
- `title: string` - Modal title
- `children: ReactNode` - Modal content
- `onConfirm?: () => void` - Confirm handler
- `confirmText?: string` - Confirm button text
- `cancelText?: string` - Cancel button text
- `variant?: 'default' | 'danger' | 'warning' | 'success'`

---

## 🔧 Implementation Details

### Toast Provider Setup
Located in: `src/app/layout.tsx`
```tsx
<Toaster 
  position="top-right"
  expand={false}
  richColors
  closeButton
/>
```

### Component Locations
- Toast Hook: `src/hooks/useToast.ts`
- Confirm Hook: `src/hooks/useConfirmDialog.ts`
- Modal: `src/components/ui/Modal.tsx`
- Loaders: `src/components/ui/Loader.tsx`

---

## 🎓 Learning Resources

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [ARIA Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Focus Management](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## ✨ Summary

This feedback system provides:
- **Complete coverage** of all feedback scenarios
- **Accessible** to all users including screen readers
- **Consistent** design language and behavior
- **User-friendly** with clear, informative messages
- **Production-ready** with error handling and edge cases

All components work together to create a seamless, trustworthy user experience that keeps users informed and in control.
