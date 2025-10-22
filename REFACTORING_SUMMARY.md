# LUPAH Platform Refactoring Summary

## Overview
This document summarizes the major refactoring of the LUPAH (Lúdico Universo da Pessoa com Altas Habilidades) platform to use TanStack Start's server functions and middleware, along with architectural improvements.

**Date**: 2025
**Framework**: TanStack Start (React)
**Backend**: Convex
**Authentication**: Clerk

---

## Major Changes

### 1. Removed Parent-Based Authentication System

#### Before:
- Parents had access codes
- `parents` table with access codes
- `studentParents` junction table
- `parentSessions` table for session management
- Parents could view multiple students

#### After:
- **Students have direct access codes**
- Single `students` table with embedded `accessCodeHash`
- Students access their own page directly
- No parent relationship tracking needed

### 2. Database Schema Changes

#### Removed Tables:
- ❌ `parents`
- ❌ `studentParents`
- ❌ `parentSessions`

#### Modified Tables:

**`students` table** - Added fields:
```typescript
{
  accessCodeHash: v.string(),           // Encrypted 8-char access code
  intelligenceTypes: v.array(v.union(   // Multiple intelligence types
    v.literal("logico-matematica"),
    v.literal("verbo-linguistica"),
    v.literal("linguagens"),
    v.literal("espacial"),
    v.literal("corporal-cinestesica"),
    v.literal("musical"),
    v.literal("interpessoal"),
    v.literal("intrapessoal"),
    v.literal("naturalista"),
    v.literal("existencial"),
    v.literal("memoria"),
    v.literal("espiritual"),
  ))
}
```

**New `studentDocuments` table** - For PDF version history:
```typescript
{
  studentId: v.id("students"),
  storageId: v.id("_storage"),         // Convex file storage ID
  fileName: v.string(),
  fileSize: v.number(),
  uploadedBy: v.string(),              // Admin email
  uploadDate: v.string(),
  isCurrent: v.boolean(),              // Only one current per student
  notes: v.optional(v.string()),
}
```

### 3. TanStack Start Server Functions

Created server-side functions in `src/server/auth.ts`:

#### Student Authentication:
```typescript
// Validate access code and create session
validateStudentAccessCode({ accessCode: string })

// Get current student from session
getCurrentStudent()

// Logout student
logoutStudent()

// Require student auth (for beforeLoad)
requireStudentAuth()
```

#### Admin Authentication:
```typescript
// Check admin status from session
checkAdminAuth()

// Set admin session after Clerk login
setAdminSession({ userId, email, role })

// Logout admin
logoutAdmin()

// Require admin auth (for beforeLoad)
requireAdminAuth()
```

### 4. Server-Side Middleware

Created middleware in `src/server/middleware.ts`:

```typescript
// Protect student routes
studentAuthMiddleware

// Protect admin routes
adminAuthMiddleware

// Debug logging
loggingMiddleware
```

### 5. Session Management

**Replaced**: Client-side `sessionStorage`
**With**: Server-side sessions using `@tanstack/react-start/server` (`useSession`)

**Benefits**:
- More secure (server-side only)
- Can't be manipulated by client
- Automatic expiration handling
- Shared across tabs/windows

**Session Structure**:
```typescript
{
  student?: {
    studentId: Id<"students">,
    name: string,
    accessedAt: number
  },
  admin?: {
    userId: string,
    email: string,
    role: string,
    accessedAt: number
  }
}
```

**Expiration Times**:
- Students: 24 hours
- Admins: 8 hours

### 6. Updated Routes

#### Home Page (`/`)
- Removed email field
- Only requires 8-character access code
- Uses `validateStudentAccessCode` server function
- Redirects to `/dashboard` on success

#### Dashboard (`/dashboard`)
- Uses `loader` with `getCurrentStudent()` server function
- Authentication checked server-side in `beforeLoad`
- No more client-side session storage
- Auto-redirects to home if not authenticated

#### Admin Routes

**`/admin/login`**:
- Uses Clerk `<SignIn />` component
- Instructions for setting admin role in Clerk metadata
- Redirects to `/admin` after successful login

**`/admin`**:
- Uses `loader` with `checkAdminAuth()` server function
- Automatically creates admin session if Clerk user has admin role
- Shows development placeholder for student management
- Admin logout functionality

**`/admin/$studentId`**:
- Edit individual student
- Upload PDF documents (with version history)
- Manage intelligence types
- Regenerate access codes
- View/restore previous document versions

### 7. Intelligence Types System

Each student can have multiple intelligence types selected:

1. **Lógico-matemática** - Raciocínio e resolução de problemas
2. **Verbo-linguística** - Linguagem, leitura e expressão verbal
3. **Linguagens** - Comunicação multimodal e simbólica
4. **Espacial** - Visualização e orientação no espaço
5. **Corporal-cinestésica** - Controle motor e expressão corporal
6. **Musical** - Ritmo, melodia e percepção sonora
7. **Interpessoal** - Habilidade social e cooperação
8. **Intrapessoal** - Autoconhecimento e regulação emocional
9. **Naturalista** - Conexão com a natureza
10. **Existencial** - Reflexão sobre perguntas profundas
11. **Memória** - Capacidade de reter e recuperar informação
12. **Espiritual** - Dimensões espirituais ou transcendentais

These are displayed on the student's dashboard and can be edited by admins.

### 8. PDF Document Management

**Features**:
- Upload PDF documents for students
- **Version history** - all uploads are preserved
- Only one "current" document shown by default
- Accordion to view previous versions
- Restore any previous version as current
- Download functionality
- Upload notes/metadata
- File size tracking
- Uploader tracking (admin email)

**File Storage**: Convex built-in file storage
- Files stored with `ctx.storage.store(blob)`
- Retrieved with `ctx.storage.getUrl(storageId)`
- Deleted with `ctx.storage.delete(storageId)`

### 9. Convex Functions Updated

**`convex/students.ts`**:
- Added `validateStudentAccessCode` mutation
- Added `regenerateAccessCode` mutation
- Added `generateDocumentUploadUrl` mutation
- Added `saveStudentDocument` mutation
- Added `deleteStudentDocument` mutation
- Added `getStudentDocuments` query
- Added `getDocumentUrl` query
- Updated `createStudent` to generate access codes
- Updated `getStudent` to include current document
- Updated `listStudents` to count documents instead of parents

**`convex/admin.ts`**:
- Added `getAllStudents` query
- Added `getStudentForAdmin` query
- Added `setCurrentDocument` mutation
- Added `checkAdminStatus` query
- Added `getDashboardStats` query

**Removed**:
- ❌ `convex/parents.ts` (entire file deleted)

### 10. Environment Variables & Session Configuration

Added to `src/env.ts`:
```typescript
SESSION_SECRET: z.string().min(32).default("...")
```

**Required in `.env.local`**:
```env
SESSION_SECRET=your-32-character-random-secret-here
```

**Session Configuration** (in `src/server/auth.ts`):
```typescript
import { useSession } from '@tanstack/react-start/server'

function useAppSession() {
  return useSession<SessionData>({
    name: 'lupah-session',
    password: process.env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 24 * 60 * 60, // 24 hours
    },
  })
}
```

---

## Security Improvements

1. **Server-Side Validation**: Access codes validated on server, not client
2. **Session Security**: HTTP-only, secure cookies with SameSite protection
3. **Automatic Expiration**: Sessions expire automatically (24h students, 8h admins)
4. **CSRF Protection**: SameSite cookies + server functions provide CSRF protection
5. **XSS Protection**: HttpOnly cookies prevent JavaScript access
6. **Clerk Integration**: Admin auth through enterprise-grade Clerk
7. **Access Code Hashing**: Codes stored as bcrypt hashes, never plaintext
8. **Environment-based Security**: Secure cookies only in production

---

## File Structure Changes

### New Files:
```
src/
├── server/
│   ├── auth.ts           # Server functions for authentication
│   └── middleware.ts     # Middleware for route protection
└── routes/
    └── admin/
        ├── login.tsx     # Admin login page (Clerk)
        ├── index.tsx     # Admin dashboard
        └── $studentId.tsx # Edit student page
```

### Deleted Files:
```
convex/
└── parents.ts           # ❌ Removed (parent system deleted)
```

### Modified Files:
```
convex/
├── schema.ts            # Updated schema (removed parents, added student fields)
├── students.ts          # Added access code & document functions
└── admin.ts             # Added admin-specific queries/mutations

src/
├── server/
│   ├── auth.ts          # Uses useSession from @tanstack/react-start/server
│   └── middleware.ts    # Uses useSession for route protection
│
└── routes/
    ├── index.tsx        # Updated to use server functions
    └── dashboard.tsx    # Updated to use loader and server functions
```

---

## Clerk Configuration Requirements

To use the admin panel, users must have the `admin` role in Clerk:

1. Go to Clerk Dashboard
2. Navigate to **Users** → Select your user
3. Click **Metadata**
4. Add to **Public metadata**:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save changes

The system checks `user.publicMetadata.role === "admin"` for authorization.

---

## Migration Notes

### For Existing Data:

If you have existing data in the old schema:

1. **Export existing student data** before running new schema
2. **Drop parent tables**: `parents`, `studentParents`, `parentSessions`
3. **Update student records** to add:
   - `accessCodeHash`: Generate new codes for each student
   - `intelligenceTypes`: Set to empty array `[]` initially
4. **Admin setup**: Configure admin users in Clerk with proper role

### Access Code Generation:

For each student, generate a new 8-character alphanumeric code:
```bash
# The system provides a function to generate secure codes
# Codes are automatically generated when creating students
```

---

## Testing Checklist

### Student Flow:
- [ ] Student can access home page
- [ ] Student can enter 8-character code
- [ ] Invalid code shows error message
- [ ] Valid code redirects to dashboard
- [ ] Dashboard shows student info
- [ ] Dashboard shows intelligence types
- [ ] Dashboard shows current PDF document
- [ ] Student can download document
- [ ] Student can view progress reports
- [ ] Student can view activities
- [ ] Student can logout

### Admin Flow:
- [ ] Admin redirected to login if not authenticated
- [ ] Clerk login works correctly
- [ ] Non-admin users see "Access Denied"
- [ ] Admin users see dashboard
- [ ] Admin can access student edit page
- [ ] Admin can edit student information
- [ ] Admin can select intelligence types
- [ ] Admin can upload PDF documents
- [ ] Admin can view document version history
- [ ] Admin can restore previous document versions
- [ ] Admin can delete documents
- [ ] Admin can regenerate access codes
- [ ] Admin can logout

---

## Performance Considerations

1. **Server Functions**: All authentication checks are server-side, reducing client bundle
2. **Lazy Loading**: Admin routes are code-split
3. **Session Caching**: Sessions cached for performance
4. **File Storage**: Convex CDN for fast document delivery

---

## Future Enhancements

### Planned Features:
1. **Admin Dashboard Statistics**
   - Total students count
   - Recent activities
   - Document upload history
   - Progress report summaries

2. **Student Management**
   - List all students with search/filter
   - Bulk operations
   - Export student data
   - Import from CSV

3. **Document Enhancements**
   - Preview PDFs in browser
   - Automatic thumbnails
   - Document annotations
   - Digital signatures

4. **Intelligence Type Reports**
   - Analytics on intelligence type distribution
   - Personalized recommendations
   - Growth tracking over time

5. **Notification System**
   - Email notifications for new documents
   - Access code delivery via email
   - Reminder notifications

---

## Development Commands

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run Convex dev
npx convex dev

# Build for production
bun run build

# Type check
tsc --noEmit
```

---

## Support & Maintenance

For questions or issues:
1. Check this documentation first
2. Review TanStack Start docs: https://tanstack.com/start
3. Review Convex docs: https://docs.convex.dev
4. Review Clerk docs: https://clerk.com/docs

---

## Technical Notes

### Session Implementation
- **Library**: `@tanstack/react-start/server`
- **Storage**: HTTP-only cookies
- **API**: `useSession<SessionData>()` hook
- **No external dependencies**: Built into TanStack Start
- **Migration**: Replaced deprecated Vinxi session management

---

**Last Updated**: 2025
**Version**: 2.0.0 (Refactored with TanStack Start Server Functions)
**Session API**: TanStack Start native sessions (not Vinxi)