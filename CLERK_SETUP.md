# Clerk Setup Guide for LUPAH

This guide walks you through configuring Clerk to work with Convex for the LUPAH admin authentication system.

---

## Prerequisites

- Clerk account created at https://clerk.com
- Convex project deployed at https://convex.dev
- Environment variables configured in `.env.local`

---

## Step 1: Create Clerk Application

1. Go to https://dashboard.clerk.com
2. Create a new application or select your existing LUPAH application
3. Note your Clerk Publishable Key and Secret Key

---

## Step 2: Configure JWT Template for Convex

### Create the Template

1. In Clerk Dashboard, go to **JWT Templates** (in the sidebar under "Configure")
2. Click **"New template"**
3. Select **"Convex"** from the template options (or create a blank template)
4. Name the template: `convex`

### Configure Template Settings

**Important**: The template name MUST be exactly `convex` (lowercase) because the code calls:
```typescript
await getToken({ template: "convex" })
```

### Template Configuration

If using a blank template, configure it as follows:

**Claims:**
```json
{
  "aud": "convex",
  "sub": "{{user.id}}"
}
```

**Token Lifetime:** 
- Set to `60` seconds (recommended for security)
- Clerk will automatically refresh tokens

**Include these standard claims:**
- ✅ User ID (`sub`)
- ✅ Issued At (`iat`)
- ✅ Expiration (`exp`)

**Optionally include:**
- Email (`{{user.primary_email_address}}`)
- Name (`{{user.full_name}}`)

### Save the Template

Click **"Save"** to create the JWT template.

---

## Step 3: Configure Convex Auth

### Update Convex Configuration

In your Convex dashboard (https://dashboard.convex.dev):

1. Go to **Settings** → **Environment Variables**
2. Add the following:

```
CLERK_ISSUER_URL=https://your-clerk-domain.clerk.accounts.dev
```

Replace `your-clerk-domain` with your actual Clerk domain from the dashboard.

### Update `convex/auth.config.ts`

If you don't have this file, create it:

```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL,
      applicationID: "convex",
    },
  ],
};
```

---

## Step 4: Set Admin Role in Clerk

Admin users need the `role: "admin"` metadata to access admin pages.

### Option A: Via Clerk Dashboard

1. Go to **Users** in Clerk Dashboard
2. Select the user who should be an admin
3. Click on **Metadata** tab
4. Under **Public Metadata**, add:

```json
{
  "role": "admin"
}
```

5. Click **Save**

### Option B: Via Clerk API

You can also set metadata programmatically:

```typescript
import { clerkClient } from "@clerk/clerk-sdk-node";

await clerkClient.users.updateUser("user_id_here", {
  publicMetadata: {
    role: "admin"
  }
});
```

---

## Step 5: Environment Variables

Ensure your `.env.local` file has these variables:

```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Convex Configuration
VITE_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment-name
```

**Important Notes:**
- `VITE_*` variables are exposed to the client (browser)
- Non-`VITE_*` variables are server-only
- Never commit `.env.local` to git

---

## Step 6: Verify the Setup

### Test JWT Template

1. In Clerk Dashboard, go to your JWT Template
2. Click **"Preview"** to see a sample token
3. Verify the token includes:
   - `aud: "convex"`
   - `sub: "user_xxxxx"`
   - `iat` and `exp` timestamps

### Test Authentication Flow

1. **Start the dev server:**
   ```bash
   bun run dev
   ```

2. **Start Convex:**
   ```bash
   bun run convex:dev
   ```

3. **Test admin login:**
   - Navigate to `/admin`
   - Sign in with your Clerk account
   - Verify you're redirected to admin dashboard

4. **Check browser console:**
   - Open DevTools → Console
   - Look for any authentication errors
   - Token should be fetched successfully

---

## Troubleshooting

### Issue: "Template not found" error

**Solution:** 
- Verify JWT template name is exactly `convex` (lowercase)
- Refresh the page to clear any cached tokens
- Re-login to get a fresh token

### Issue: "Invalid token" error

**Solution:**
- Check `CLERK_ISSUER_URL` in Convex environment variables
- Verify the issuer URL matches your Clerk domain
- Ensure JWT template includes `aud: "convex"`

### Issue: "Access denied" even though user has admin role

**Solution:**
- Verify public metadata has `role: "admin"` (exact spelling)
- Sign out and sign back in to get fresh token with new metadata
- Check Convex function is correctly reading `ctx.auth.getUserIdentity()`

### Issue: Token expires too quickly

**Solution:**
- JWT templates auto-refresh in the background
- If you need longer sessions, increase token lifetime in template settings
- Default 60 seconds is recommended for security

---

## Security Best Practices

### 1. Keep Secrets Secret
- ✅ Never expose `CLERK_SECRET_KEY` client-side
- ✅ Use server functions to proxy Convex calls
- ✅ Don't commit `.env.local` to version control

### 2. Validate on Server
- ✅ Always check user role in Convex functions
- ✅ Don't trust client-side role checks alone
- ✅ Use `ctx.auth.getUserIdentity()` in mutations

### 3. Limit Admin Access
- ✅ Only set `role: "admin"` for trusted users
- ✅ Audit admin actions in production
- ✅ Consider adding action logging

### 4. Token Security
- ✅ Use short token lifetimes (60 seconds recommended)
- ✅ Let Clerk handle token refresh automatically
- ✅ Invalidate sessions when users are removed

---

## Testing Checklist

Before deploying to production:

- [ ] JWT template named `convex` exists in Clerk
- [ ] Template includes correct claims (`aud`, `sub`)
- [ ] `CLERK_ISSUER_URL` set in Convex environment
- [ ] Admin user has `publicMetadata.role = "admin"`
- [ ] Can login to `/admin` with admin user
- [ ] Non-admin users see "Access Denied" message
- [ ] Dashboard loads student list correctly
- [ ] Can view/edit student details
- [ ] Can upload documents
- [ ] Can regenerate access codes
- [ ] All operations validate admin role server-side

---

## Additional Resources

- [Clerk + Convex Integration Guide](https://docs.convex.dev/auth/clerk)
- [Clerk JWT Templates Documentation](https://clerk.com/docs/backend-requests/making/jwt-templates)
- [Clerk Metadata Documentation](https://clerk.com/docs/users/metadata)
- [Convex Authentication Documentation](https://docs.convex.dev/auth)

---

## Support

If you encounter issues:

1. Check Clerk logs: https://dashboard.clerk.com/logs
2. Check Convex logs: https://dashboard.convex.dev/logs
3. Review browser console for client-side errors
4. Verify all environment variables are set correctly

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0  
**Status:** Production Ready