# Migration to TanStack Start Native Sessions

## Summary

This document outlines the migration from Vinxi sessions to TanStack Start's native session management system.

## What Changed

### Before (Vinxi)
```typescript
import { useAppSession } from "vinxi/http";

async function getSession() {
  return await useAppSession({
    password: process.env.SESSION_SECRET
  });
}
```

### After (TanStack Start)
```typescript
import { useSession } from "@tanstack/react-start/server";

async function getSession() {
  return await useSession<SessionData>({
    name: "lupah-session",
    password: process.env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60, // 24 hours
    },
  });
}
```

## Key Differences

### 1. Import Path
- **Old**: `vinxi/http`
- **New**: `@tanstack/react-start/server`

### 2. Function Name
- **Old**: `useAppSession()`
- **New**: `useSession()`

### 3. Configuration
TanStack Start's `useSession` provides more granular control:
- `name`: Session cookie name
- `password`: Encryption secret (32+ characters)
- `cookie`: Full cookie configuration object

### 4. Cookie Settings
Now explicitly configured:
```typescript
cookie: {
  secure: true,     // HTTPS only in production
  sameSite: 'lax',  // CSRF protection
  httpOnly: true,   // XSS protection
  maxAge: 86400,    // Session duration in seconds
}
```

## Files Updated

### 1. `src/server/auth.ts`
- Changed import from `vinxi/http` to `@tanstack/react-start/server`
- Updated `getSession()` function with new API
- Added explicit cookie configuration
- All session operations now use `await getSession()`

### 2. `src/server/middleware.ts`
- Same changes as auth.ts
- Middleware functions properly await session

### 3. Documentation
- `SETUP_GUIDE.md`: Removed Vinxi references
- `REFACTORING_SUMMARY.md`: Updated session API details

## Session API

### Available Methods

```typescript
const session = await getSession();

// Read session data
const data = session.data;

// Update session data
await session.update({ userId: "123" });

// Clear entire session
await session.clear();
```

### Session Data Type

```typescript
type SessionData = {
  student?: {
    studentId: Id<"students">;
    name: string;
    accessedAt: number;
  };
  admin?: {
    userId: string;
    email: string;
    role: string;
    accessedAt: number;
  };
};
```

## Security Improvements

1. **Explicit Cookie Configuration**: All security settings are now visible and configurable
2. **Environment-Based Security**: `secure` flag automatically enabled in production
3. **Better CSRF Protection**: SameSite cookies properly configured
4. **XSS Protection**: HttpOnly cookies prevent JavaScript access
5. **Configurable Expiration**: MaxAge explicitly set for each session type

## TypeScript Considerations

### False Positive Hook Warning

You may see this warning:
```
This hook is being called indirectly and conditionally
```

This is a **false positive**. The `useSession` hook is always called in the same order within server functions. This warning can be safely ignored or suppressed.

**Why it appears**: TypeScript's React hooks linter doesn't understand that server functions have different execution contexts than React components.

**Solution**: Add to `.eslintrc` or `biome.json`:
```json
{
  "rules": {
    "react-hooks/rules-of-hooks": "off"
  }
}
```

Or add inline comment:
```typescript
// eslint-disable-next-line react-hooks/rules-of-hooks
return await useSession<SessionData>({ ... });
```

## Testing

### Verify Session Functionality

1. **Student Login**
   ```bash
   # Test access code validation
   curl -X POST http://localhost:3000/api/validateStudentAccessCode \
     -H "Content-Type: application/json" \
     -d '{"accessCode":"ABC12345"}'
   ```

2. **Check Session Cookie**
   - Open browser DevTools → Application → Cookies
   - Look for `lupah-session` cookie
   - Verify flags: `HttpOnly`, `Secure` (in production), `SameSite=Lax`

3. **Test Expiration**
   - Login as student
   - Wait 24+ hours
   - Access dashboard (should redirect to home)

4. **Test Admin Session**
   - Login via Clerk
   - Check admin session created
   - Verify 8-hour expiration (check `accessedAt` timestamp)

## Troubleshooting

### Session Not Persisting

**Symptoms**: User logs in but session doesn't persist across requests

**Solutions**:
1. Verify `SESSION_SECRET` is set in `.env.local`
2. Ensure secret is at least 32 characters
3. Restart development server after adding env variables
4. Clear browser cookies and try again
5. Check that `cookie.httpOnly` is `true`

### "Cannot find module" Error

**Symptoms**: 
```
Cannot find module '@tanstack/react-start/server'
```

**Solutions**:
1. Ensure TanStack Start is properly installed:
   ```bash
   bun install @tanstack/react-start
   ```
2. Check package.json for correct version
3. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   bun install
   ```

### Session Clears Unexpectedly

**Symptoms**: User gets logged out randomly

**Possible Causes**:
1. `maxAge` too short (check cookie configuration)
2. Server restarting clears in-memory sessions (expected in dev)
3. `SESSION_SECRET` changing between restarts
4. Browser blocking third-party cookies (check browser settings)

**Solutions**:
1. Increase `maxAge` in session configuration
2. In production, use persistent session store if needed
3. Use a fixed `SESSION_SECRET` in `.env.local`
4. Test with third-party cookies enabled

## Production Checklist

Before deploying to production:

- [ ] Set `SESSION_SECRET` to a cryptographically random string (32+ chars)
- [ ] Never commit `SESSION_SECRET` to version control
- [ ] Verify `secure: true` in production environment
- [ ] Test session persistence across deployments
- [ ] Configure session store if using multiple servers (optional)
- [ ] Monitor session-related errors in production logs
- [ ] Set up session cleanup job if needed
- [ ] Test cookie behavior in all target browsers
- [ ] Verify HTTPS is enforced in production
- [ ] Document session configuration for team

## Additional Resources

- [TanStack Start Sessions Docs](https://tanstack.com/start/latest/docs/framework/react/guide/authentication)
- [Cookie Security Best Practices](https://owasp.org/www-community/controls/SecureCookieAttribute)
- [SameSite Cookie Explanation](https://web.dev/samesite-cookies-explained/)

## Migration Timeline

- **2025-01**: Vinxi deprecated in TanStack Start
- **Current**: Migrated to native TanStack Start sessions
- **Status**: ✅ Complete

## Support

For issues or questions:
1. Check this document first
2. Review `SETUP_GUIDE.md`
3. Check `REFACTORING_SUMMARY.md`
4. Review TanStack Start documentation
5. Open an issue in project repository

---

**Last Updated**: 2025  
**Migration Status**: Complete  
**TanStack Start Version**: Latest (Vite-based)