# Loading & Error States - Quick Testing Guide

## 🚀 Quick Start

### Test Loading State (3 Easy Steps)

1. **Open the API Route**
   ```
   jeevan-rakth/src/app/api/users/route.ts
   ```

2. **Uncomment this line** (around line 21):
   ```typescript
   await simulateDelay(3000);
   ```

3. **Visit the page**
   - Navigate to: `http://localhost:3000/users`
   - You'll see the loading skeleton for 3 seconds
   - Then the actual data loads

### Test Error State (3 Easy Steps)

1. **Open the API Route**
   ```
   jeevan-rakth/src/app/api/users/route.ts
   ```

2. **Uncomment this line** (around line 24):
   ```typescript
   simulateError('Database connection failed');
   ```

3. **Visit the page**
   - Navigate to: `http://localhost:3000/users`
   - You'll see the error boundary
   - Click "Try Again" to test retry functionality

---

## 📸 What You'll See

### Loading State
```
┌─────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░      │  ← Header (pulsing)
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░       │  ← Subtitle (pulsing)
│                                          │
│  ╔══════════════════════════════════╗   │
│  ║ ◯ ▓▓▓▓▓░░░ │ ▓▓▓▓░░ │ ▓▓░░ │...║   │  ← Table Row 1
│  ║ ◯ ▓▓▓▓▓░░░ │ ▓▓▓▓░░ │ ▓▓░░ │...║   │  ← Table Row 2
│  ║ ◯ ▓▓▓▓▓░░░ │ ▓▓▓▓░░ │ ▓▓░░ │...║   │  ← Table Row 3
│  ╚══════════════════════════════════╝   │
└─────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────┐
│                                          │
│              ⚠️                          │
│         (Warning Icon)                   │
│                                          │
│    Oops! Something went wrong           │
│                                          │
│    Database connection failed           │
│                                          │
│    ┌──────────────────┐                 │
│    │   Try Again      │                 │
│    └──────────────────┘                 │
│                                          │
│    If the problem persists,             │
│    please contact support.              │
│                                          │
└─────────────────────────────────────────┘
```

### Success State
```
┌─────────────────────────────────────────┐
│  User Management                         │
│  View and manage all registered users   │
│                                          │
│  ┌────────────┐                          │
│  │ + Add User │                          │
│  └────────────┘                          │
│                                          │
│  ╔══════════════════════════════════╗   │
│  ║ User │ Email │ Blood │ Role │...║   │
│  ╟──────────────────────────────────╢   │
│  ║ JD   │ john@ │  A+   │Admin│ V D ║   │
│  ║ MJ   │ mary@ │  O-   │User │ V D ║   │
│  ║ RS   │ ram@  │  B+   │User │ V D ║   │
│  ╚══════════════════════════════════╝   │
└─────────────────────────────────────────┘
```

---

## 🔄 Testing Workflow

### 1. Test Normal Flow
```bash
# Start dev server
npm run dev

# Visit: http://localhost:3000/users
# Should load normally with user data
```

### 2. Test Loading Skeleton
```typescript
// In: src/app/api/users/route.ts
// Uncomment:
await simulateDelay(3000);

// Refresh page → See skeleton for 3 seconds
```

### 3. Test Error Boundary
```typescript
// In: src/app/api/users/route.ts
// Comment out delay, uncomment:
simulateError('Database offline');

// Refresh page → See error boundary
// Click "Try Again" → Error persists (because we forced it)
```

### 4. Test Retry Functionality
```typescript
// Remove the simulateError() call
// Now click "Try Again" on error boundary
// Should successfully load data
```

---

## 🛠️ Browser DevTools Testing

### Simulate Slow Network
1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Change dropdown from "No throttling" to **"Slow 3G"**
4. Navigate to `/users` or `/dashboard`
5. Observe loading skeleton

### Simulate Offline
1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Check **"Offline"** checkbox
4. Try navigating to `/users`
5. See error boundary (network failure)

---

## 📋 Routes Available

| Route | Loading | Error | Description |
|-------|---------|-------|-------------|
| `/users` | ✅ | ✅ | User management table with skeleton |
| `/dashboard` | ✅ | ✅ | Dashboard stats with skeleton |

---

## 💡 Pro Tips

1. **Use Browser Throttling** - More realistic than code delays
2. **Test on Mobile** - Slower connections show skeletons more
3. **Check Console** - Errors logged for debugging
4. **Try Offline Mode** - Best way to test error boundaries
5. **Test Retry** - Make sure `reset()` works properly

---

## 📝 Quick Checklist

- [ ] Loading skeleton displays correctly
- [ ] Skeleton matches actual page layout
- [ ] Error boundary shows on API failure
- [ ] Error message is user-friendly
- [ ] "Try Again" button works
- [ ] Page recovers after retry
- [ ] No console errors
- [ ] Works on slow network
- [ ] Works offline
- [ ] Mobile responsive

---

## 🎯 Expected Results

### ✅ Good Loading State
- Skeleton appears immediately
- Smooth pulse animation
- Layout matches final content
- No layout shift when data loads

### ✅ Good Error State
- Clear error message
- Professional icon/design
- Working retry button
- Helpful support text
- No crash or blank screen

### ❌ Issues to Avoid
- Long blank screen before skeleton
- Skeleton doesn't match layout
- Error shows technical jargon
- Retry button doesn't work
- Page crashes on error

---

## 🔗 Files Reference

- **Loading States**: 
  - [/users/loading.tsx](jeevan-rakth/src/app/users/loading.tsx)
  - [/dashboard/loading.tsx](jeevan-rakth/src/app/dashboard/loading.tsx)

- **Error Boundaries**:
  - [/users/error.tsx](jeevan-rakth/src/app/users/error.tsx)
  - [/dashboard/error.tsx](jeevan-rakth/src/app/dashboard/error.tsx)

- **Test Utilities**:
  - [testUtils.ts](jeevan-rakth/src/lib/testUtils.ts)

- **Full Documentation**:
  - [LOADING_ERROR_STATES.md](LOADING_ERROR_STATES.md)

---

**Last Updated**: December 29, 2025
