# TechMNHub Admin Dashboard - Extension Guide

This guide explains how to extend and customize the TechMNHub Admin Dashboard for your specific needs.

## Table of Contents
1. [Adding a New Page](#adding-a-new-page)
2. [Adding a New Component](#adding-a-new-component)
3. [Styling Customization](#styling-customization)
4. [API Integration](#api-integration)
5. [Adding Authentication](#adding-authentication)
6. [Database Integration](#database-integration)

---

## Adding a New Page

### Step 1: Create the Page File

Create a new file at `/app/admin/[page-name]/page.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";

export default function NewPage() {
  const [page, setPage] = useState(1);

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ["new-resource", page],
    queryFn: () => getNewResource(page),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">New Page Title</h1>
      <p className="text-white/60">Page description goes here</p>

      {/* Your content */}
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-300">Error loading data</p>}
      {data && (
        <GlassCard>
          {/* Render your data */}
        </GlassCard>
      )}
    </div>
  );
}
```

### Step 2: Add API Functions

Add to `/lib/api-client.ts`:

```typescript
export interface NewResource {
  id: string;
  name: string;
  // ... other fields
}

export async function getNewResource(page: number = 1): Promise<NewResource[]> {
  try {
    const response = await fetch(`/api/new-resource?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}
```

### Step 3: Update Sidebar Navigation

Edit `/app/admin/layout.tsx` and add to the navigation:

```typescript
{
  name: "New Page",
  href: "/admin/new-page",
  icon: IconName,
  current: pathname === "/admin/new-page",
}
```

---

## Adding a New Component

### Creating a Glass Component

Create `/components/glass/GlassNewComponent.tsx`:

```typescript
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassNewComponentProps {
  className?: string;
  children?: React.ReactNode;
  // ... other props
}

export function GlassNewComponent({
  className,
  children,
  ...props
}: GlassNewComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-lg border border-white/20 bg-white/10 backdrop-blur-md",
        "hover:border-white/30 transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### Using TypeScript Props

Always define proper interfaces:

```typescript
interface ComponentProps {
  /** Description of prop */
  propName: string;
  /** Optional prop */
  optionalProp?: React.ReactNode;
  /** Callback function */
  onAction?: (data: unknown) => void;
}

export function Component({ propName, optionalProp, onAction }: ComponentProps) {
  // Implementation
}
```

---

## Styling Customization

### Updating the Color Palette

Edit `/app/globals.css`:

```css
@import 'tailwindcss';

@theme {
  --color-primary: #06B6D4;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #3B82F6;
  
  --font-sans: 'System UI', 'Helvetica Neue', sans-serif;
  --font-mono: 'Menlo', 'Monaco', monospace;
  
  --radius: 0.75rem;
}
```

### Creating Custom Glass Effects

Add to globals.css:

```css
.glass-primary {
  @apply rounded-lg border border-white/20 bg-white/10 backdrop-blur-md;
}

.glass-secondary {
  @apply rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm;
}

.glass-hover {
  @apply transition-all duration-200 hover:border-white/30 hover:bg-white/15;
}
```

### Responsive Design

Use Tailwind breakpoints:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

---

## API Integration

### Setting Up a Real API

Update environment variables:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
API_SECRET=your_secret_key
```

### Updating API Client

Modify `/lib/api-client.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_SECRET = process.env.API_SECRET;

export async function fetchWithAuth(endpoint: string, options?: RequestInit) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_SECRET}`,
    ...options?.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getResource(id: string) {
  return fetchWithAuth(`/api/resources/${id}`);
}
```

### Adding Request/Response Interceptors

Create `/lib/api-interceptors.ts`:

```typescript
export interface ApiRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function apiCall<T>(request: ApiRequest): Promise<T> {
  // Pre-request processing
  console.log(`[API] ${request.method} ${request.endpoint}`);

  // Make request
  const response = await fetch(`${API_URL}${request.endpoint}`, {
    method: request.method,
    headers: { 'Content-Type': 'application/json' },
    body: request.data ? JSON.stringify(request.data) : undefined,
  });

  // Post-response processing
  const result = await response.json();
  console.log(`[API] Response:`, result);

  return result;
}
```

---

## Adding Authentication

### Basic Auth Context

The dashboard includes an `AuthContext` at `/contexts/AuthContext.tsx`. Enhance it:

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const { user, token, permissions } = await response.json();
    localStorage.setItem('token', token);
    setUser(user);
    setPermissions(permissions);
  };

  const hasPermission = (permission: string) => permissions.includes(permission);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout: () => setUser(null), permissions, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Protected Routes

Create `/lib/protected-route.tsx`:

```typescript
export function ProtectedRoute({ 
  children, 
  requiredPermission 
}: { 
  children: React.ReactNode;
  requiredPermission?: string;
}) {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <redirect to="/login" />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <div>Access Denied</div>;
  }

  return children;
}
```

---

## Database Integration

### Connecting to Neon PostgreSQL

1. Install dependencies:
```bash
npm install @neondatabase/serverless drizzle-orm
```

2. Create `/lib/db.ts`:
```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from '@neondatabase/serverless';

export const db = drizzle(sql);
```

3. Create schema `/lib/schema.ts`:
```typescript
import { pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

4. Replace API client calls with database queries:
```typescript
import { db } from '@/lib/db';
import { students } from '@/lib/schema';

export async function getStudents() {
  return db.select().from(students);
}
```

### Using Supabase

1. Initialize Supabase:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

2. Fetch data:
```typescript
export async function getStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*');
  return data || [];
}
```

---

## Common Customizations

### Adding Dark Mode

Update `/app/globals.css`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
  }
}

.dark {
  @apply bg-slate-950 text-white;
}
```

### Changing Primary Color

Update all references from cyan to your color:

```css
/* In globals.css */
--color-primary: #YOUR_HEX_CODE;

/* In components */
className="bg-primary hover:bg-primary/90"
```

### Adding Localization

1. Install i18n:
```bash
npm install next-intl
```

2. Add language files in `/locales/en.json`
3. Use in components:
```typescript
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations();
  return <h1>{t('dashboard.title')}</h1>;
}
```

---

## Performance Optimization

### Image Optimization

Use Next.js Image:
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={40}
  height={40}
  priority
/>
```

### Code Splitting

Use dynamic imports:
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/Heavy'));
```

### Caching Strategy

Configure React Query defaults in `layout.tsx`:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime)
    },
  },
});
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Database connected
- [ ] Authentication implemented
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Accessibility verified
- [ ] Build test passed
- [ ] Security review done
- [ ] Documentation updated

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [React Query](https://tanstack.com/query)
- [TypeScript](https://typescriptlang.org)

---

## Support

For issues or questions, refer to:
1. `PROJECT_SUMMARY.md` - Project overview
2. `VERIFICATION_REPORT.md` - Testing details
3. Component JSDoc comments - Inline docs
4. Type definitions - TypeScript interfaces

Good luck with your customizations!
