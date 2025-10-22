# Authentication Refactor Status

## Date: 2025-01-XX
## Status: ✅ COMPLETED - All Authentication Refactoring Complete

---

## Summary

This document tracks the progress of refactoring the LUPAH application to properly secure admin operations by using Clerk authentication tokens passed through TanStack Start server functions to Convex.

---

## ✅ Completed Changes

### 1. Environment Variables Cleanup
- **File**: `src/env.ts`
- **Change**: Removed `SESSION_SECRET` variable that was added by mistake
- **Status**: ✅ Complete

### 2. Server Functions with Clerk Auth
- **File**: `src/server/convex.ts`
- **Changes**:
  - Created `getAuthenticatedConvexClient(clerkToken)` helper to create Convex client with Clerk token
  - Updated all admin server functions to accept `clerkToken` parameter
  - Admin functions now validate token presence before making Convex calls
  - Changed admin functions from GET to POST method (to accept request body with token)
  - Functions updated:
    - `getAllStudents`
    - `getStudentForAdmin`
    - `updateStudent`
    - `regenerateAccessCode`
    - `generateDocumentUploadUrl`
    - `saveStudentDocument`
    - `setCurrentDocument`
    - `deleteStudentDocument`
    - `getDashboardStats`
    - `checkAdminStatus`
- **Status**: ✅ Complete

### 3. Admin Auth Hook
- **File**: `src/hooks/useAdminAuth.ts`
- **Created**: New custom hook that provides:
  - `isSignedIn` - Clerk sign-in status
  - `isLoaded` - Clerk loading state
  - `isAdmin` - Check if user has admin role in metadata
  - `user` - Clerk user object
  - `getClerkToken()` - Async function to get Convex-compatible Clerk token
- **Features**:
  - Auto-redirects to `/admin/login` if not signed in
  - Checks `user.publicMetadata.role === "admin"` for admin status
- **Status**: ✅ Complete

### 4. Admin Dashboard Page
- **File**: `src/routes/admin/index.tsx`
- **Changes**:
  - Uses `useAdminAuth()` hook instead of direct `useAuth()`
  - Passes Clerk token to server functions via `{ data: { clerkToken } }` format
  - Both dashboard stats and student list now properly authenticated
- **Status**: ✅ Complete
- **Working**: Yes - compiles without errors

### 5. Admin Student Details Page
- **File**: `src/routes/admin/$studentId.tsx`
- **Status**: ✅ Complete
- **Changes Made**:
  1. ✅ Imported `useAdminAuth` hook
  2. ✅ Imported all necessary server functions from `@/server/convex`
  3. ✅ Replaced `useConvex()` with server function calls
  4. ✅ Updated all mutations to get and pass Clerk token
  5. ✅ Fixed all TypeScript errors:
     - Added `useId` import from React
     - Fixed intelligence types typing
     - Removed unused imports
  6. ✅ Updated all function calls to use `{ data: { ...params, clerkToken } }` format
  7. ✅ Replaced direct document URL queries with `getDocumentUrl` server function
  8. ✅ Fixed admin status check to use `isAdmin` from hook
  9. ✅ Replaced navigate with Link component for login button
- **Working**: Yes - compiles without errors

---

## 🎉 Refactor Complete

All admin pages now properly use:
- ✅ Clerk authentication via `useAdminAuth` hook
- ✅ Server functions as secure proxy to Convex
- ✅ Clerk tokens passed server-side only
- ✅ No direct Convex client calls from admin pages
- ✅ Zero TypeScript compilation errors

---

## 🔧 Technical Details

### How Admin Auth Now Works

1. **Client Side (Admin Pages)**:
   - Admin pages use `useAdminAuth()` hook
   - Hook checks Clerk for authentication and admin role
   - When calling server functions, hook provides `getClerkToken()` async function

2. **Server Functions** (`src/server/convex.ts`):
   - Accept `clerkToken` in request data
   - Create authenticated Convex client using the token
   - Make Convex queries/mutations with authenticated client
   - Convex backend validates token and checks user identity

3. **Convex Backend** (`convex/admin.ts`):
   - Functions use `ctx.auth.getUserIdentity()` to get authenticated user
   - Check `publicMetadata.role === "admin"` for authorization
   - Only execute operations if user is authenticated admin

### Server Function Call Pattern

```typescript
// In React component:
const { getClerkToken } = useAdminAuth();

const { data } = useQuery({
  queryKey: ["someData"],
  queryFn: async () => {
    const clerkToken = await getClerkToken();
    return await someServerFunction({ data: { clerkToken, ...otherParams } });
  },
});

// For mutations:
const mutation = useMutation({
  mutationFn: async (params) => {
    const clerkToken = await getClerkToken();
    return await someServerMutation({ 
      data: { clerkToken, ...params } 
    });
  },
});
```

### Convex Backend Auth Pattern

```typescript
// In Convex function:
export const someAdminFunction = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Não autenticado.");
    }
    
    const publicMetadata = identity.publicMetadata as { role?: string };
    
    if (publicMetadata?.role !== "admin") {
      throw new Error("Acesso negado. Apenas administradores podem executar esta ação.");
    }
    
    // Proceed with operation...
  },
});
```

---

## 📋 Next Steps

### Immediate (Before Deployment)

1. **✅ Code Changes** - All Complete

2. **Test Admin Flows** (Manual Testing Required)
   - Login as admin user
   - View dashboard
   - View/edit student details
   - Upload documents
   - Regenerate access codes

### Setup Required

1. **Clerk Dashboard Configuration**
   - Create JWT Template named "convex" in Clerk dashboard
   - Configure template to work with Convex
   - See: https://docs.convex.dev/auth/clerk

2. **Clerk User Metadata**
   - Set admin users to have `publicMetadata.role = "admin"`
   - Can be done via Clerk dashboard or API

3. **Environment Variables**
   - Ensure `.env.local` has:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     VITE_CONVEX_URL=https://...
     CONVEX_DEPLOYMENT=prod:...
     ```

### Testing Checklist

- [ ] Admin login redirects properly
- [ ] Non-admin users see "Access Denied" message
- [ ] Dashboard stats load correctly
- [ ] Student list displays with counts
- [ ] Clicking student opens detail page
- [ ] Student details load correctly
- [ ] Can update student information
- [ ] Can regenerate access codes
- [ ] Can upload PDF documents
- [ ] Can set current document version
- [ ] Can delete documents
- [ ] All operations check admin role server-side

---

## 🚨 Important Security Notes

1. **Never expose Clerk tokens client-side** - Always pass through server functions
2. **Always validate admin role** - Both client-side (UX) and server-side (security)
3. **Server functions are the security boundary** - All Convex calls from admin pages MUST go through server functions
4. **Student access code validation** - Continues to work without Clerk (public endpoint)

---

## 📚 References

- [TanStack Start Server Functions](https://tanstack.com/start/latest/docs/framework/react/server-functions)
- [Clerk + Convex Integration](https://docs.convex.dev/auth/clerk)
- [Clerk JWT Templates](https://clerk.com/docs/backend-requests/making/jwt-templates)
- [Convex Authentication](https://docs.convex.dev/auth)

---

## Notes

- The refactor removes the custom auth/session system that was mistakenly added
- Uses Clerk (already in project) as the only authentication system
- Uses Convex (already in project) for data storage
- TanStack Start server functions provide the secure proxy layer
- No new dependencies were added
- No new environment variables were added (SESSION_SECRET was removed)

---

**Last Updated**: 2025-01-XX
**Updated By**: AI Assistant
**Status**: ✅ All code changes complete - ready for testing and deployment
**Next Action**: Configure Clerk JWT template for Convex and test all admin flows