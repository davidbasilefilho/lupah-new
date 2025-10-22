# LUPAH Platform - Setup Guide

## Prerequisites

- **Node.js**: v18+ or **Bun**: v1.0+
- **Convex Account**: https://convex.dev
- **Clerk Account**: https://clerk.com

---

## Initial Setup

### 1. Install Dependencies

```bash
bun install
# or
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
# Convex
VITE_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Session Secret (generate a random 32+ character string)
SESSION_SECRET=your-random-32-character-secret-here-change-this
```

#### Generate Session Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Convex Setup

```bash
# Login to Convex
npx convex login

# Initialize Convex (if not already done)
npx convex dev

# This will:
# - Create a new Convex project (if needed)
# - Generate CONVEX_URL
# - Push your schema to Convex
# - Start the development server
```

### 4. Clerk Setup

1. Go to https://clerk.com/dashboard
2. Create a new application or select existing
3. Get your API keys from **API Keys** section
4. Copy `Publishable Key` → `VITE_CLERK_PUBLISHABLE_KEY`
5. Copy `Secret Key` → `CLERK_SECRET_KEY`

#### Configure Admin Users

For each admin user:

1. Go to **Users** in Clerk Dashboard
2. Click on the user
3. Go to **Metadata** tab
4. Add to **Public metadata**:
   ```json
   {
     "role": "admin"
   }
   ```
5. Click **Save**

---

## Development

### Start Development Servers

You need to run TWO servers:

**Terminal 1 - Convex Backend:**
```bash
npx convex dev
```

**Terminal 2 - TanStack Start Frontend:**
```bash
bun run dev
# or
npm run dev
```

The app will be available at: http://localhost:3000

---

## Creating Your First Student

### Option 1: Via Convex Dashboard

1. Go to http://localhost:3000/_convex (Convex dev dashboard)
2. Navigate to **Data** → **students** table
3. Click **Add Document**
4. Fill in the fields:
   ```json
   {
     "name": "João Silva",
     "dateOfBirth": "2010-05-15",
     "enrollmentDate": "2024-01-10",
     "grade": "8º ano",
     "status": "active",
     "notes": "Student notes here",
     "accessCodeHash": "$2a$10$...", // See below for generating
     "intelligenceTypes": ["logico-matematica", "musical"]
   }
   ```

### Option 2: Generate Access Code via Script

Create a temporary script to generate students with access codes:

**Create `generate-student.js`:**
```javascript
const bcrypt = require('bcrypt');

// Generate a random 8-character alphanumeric code
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function main() {
  const accessCode = generateCode();
  const accessCodeHash = await bcrypt.hash(accessCode, 10);
  
  console.log('Access Code:', accessCode);
  console.log('Access Code Hash:', accessCodeHash);
  console.log('\nUse this hash in the Convex dashboard');
  console.log('Give the Access Code to the student');
}

main();
```

Run it:
```bash
bun run generate-student.js
```

---

## Testing the System

### Test Student Access

1. Go to http://localhost:3000
2. Enter the 8-character access code
3. Should redirect to `/dashboard`
4. Verify student can see their information

### Test Admin Access

1. Go to http://localhost:3000/admin/login
2. Sign in with Clerk account that has `role: "admin"`
3. Should redirect to `/admin`
4. Access student edit page: `/admin/[studentId]`

---

## Common Issues & Solutions

### Issue: Session types not found

**Solution**: Make sure you're importing from `@tanstack/react-start/server`:

```typescript
import { useSession } from '@tanstack/react-start/server'
```

The session management is built into TanStack Start and doesn't require additional dependencies.

### Issue: Session not persisting

**Solution**: 
- Ensure `SESSION_SECRET` is set in `.env.local`
- Restart the dev server after adding env variables
- Clear browser cookies and try again

### Issue: Admin sees "Access Denied"

**Solution**:
- Verify user has `"role": "admin"` in Clerk Public metadata
- Log out and log back in after setting metadata
- Check browser console for errors

### Issue: Access code not working

**Solution**:
- Verify the code is exactly 8 alphanumeric characters
- Check that `accessCodeHash` is properly stored in database
- Ensure Convex server is running (`npx convex dev`)

### Issue: PDF upload fails

**Solution**:
- Check file is PDF format
- Verify Convex storage is enabled
- Check file size is reasonable (<10MB recommended)
- Verify admin is properly authenticated

---

## Project Structure

```
lupah-new/
├── convex/                      # Convex backend
│   ├── schema.ts               # Database schema
│   ├── students.ts             # Student queries/mutations
│   ├── admin.ts                # Admin operations
│   └── lib/
│       └── crypto.ts           # Access code hashing
│
├── src/
│   ├── server/                 # TanStack Start server functions
│   │   ├── auth.ts            # Authentication (uses useSession)
│   │   └── middleware.ts      # Route protection middleware
│   │
│   ├── routes/                 # Application routes
│   │   ├── __root.tsx         # Root layout
│   │   ├── index.tsx          # Home page (student login)
│   │   ├── dashboard.tsx      # Student dashboard
│   │   └── admin/
│   │       ├── login.tsx      # Admin login
│   │       ├── index.tsx      # Admin dashboard
│   │       └── $studentId.tsx # Edit student
│   │
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   │
│   ├── integrations/         # Third-party integrations
│   │   ├── clerk/           # Clerk setup
│   │   └── convex/          # Convex setup
│   │
│   └── env.ts               # Environment variable validation
│
└── .env.local               # Local environment variables
```

**Key Points**:
- Session management uses `useSession` from `@tanstack/react-start/server`
- No external session libraries needed (Vinxi is deprecated)
- Sessions are HTTP-only cookies with configurable expiration

---

## Deployment

### Deploy to Vercel

1. **Push to Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy Convex:**
   ```bash
   npx convex deploy
   ```
   This gives you a production CONVEX_URL

3. **Configure Vercel:**
   - Go to https://vercel.com
   - Import your Git repository
   - Add environment variables:
     - `VITE_CONVEX_URL` (production URL from Convex)
     - `CONVEX_DEPLOYMENT` (production deployment name)
     - `VITE_CLERK_PUBLISHABLE_KEY` (production key)
     - `CLERK_SECRET_KEY` (production key)
     - `SESSION_SECRET` (strong random string)

4. **Update Clerk:**
   - Add your Vercel domain to Clerk allowed origins
   - Update redirect URLs in Clerk dashboard

5. **Deploy:**
   ```bash
   vercel
   ```

---

## Security Checklist

- [ ] Change default `SESSION_SECRET` to random 32+ character string
- [ ] Never commit `.env.local` to version control
- [ ] Use production Clerk keys for production
- [ ] Enable Clerk email verification
- [ ] Regularly rotate access codes if compromised
- [ ] Review Convex security rules
- [ ] Enable HTTPS in production
- [ ] Set up Convex backup schedule
- [ ] Monitor failed login attempts
- [ ] Set up error logging (Sentry, etc.)

---

## Getting Help

- **TanStack Start Docs**: https://tanstack.com/start
- **Convex Docs**: https://docs.convex.dev
- **Clerk Docs**: https://clerk.com/docs
- **Project Issues**: Check `REFACTORING_SUMMARY.md`

---

**Last Updated**: 2025
**Version**: 2.0.0