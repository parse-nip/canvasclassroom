# Test Accounts

Use these accounts to test the application:

## Teacher Account
- **Email**: `teacher@test.com`
- **Password**: `test123`
- **User ID**: `7c583ab1-3310-4952-8507-4d3f5302d84c`
- **Role**: teacher

## Student Account
- **Email**: `student@test.com`
- **Password**: `test123`
- **User ID**: `e0f161a1-9a65-4a64-8ab7-adda1f3a0530`
- **Role**: student

## Notes
- Both accounts have verified emails
- Passwords are hashed with bcrypt in the database
- Use these credentials for testing authentication flows
- The student account has a corresponding record in the `public.students` table

## Troubleshooting "Database error querying schema"

If you see this error when signing in:

1. **Check browser console** - Look for specific error messages from Supabase
2. **Verify environment variables**:
   - Open browser DevTools → Console
   - You should see: `🔧 Supabase Config: { url: 'https://hextgwydmgdxik...', key: 'eyJhbGciOiJIUzI1NiIs...' }`
   - If you see 'MISSING', environment variables are not set correctly in Vercel

3. **Check Supabase Dashboard**:
   - Go to Authentication → Users
   - Verify the test accounts exist
   - Check that `email_confirmed_at` is not null

4. **RLS Policies**: The error might be from RLS blocking access. Check:
   - Supabase Dashboard → Authentication → Policies
   - Ensure policies allow public access or are properly configured for your use case

5. **Re-deploy**: If environment variables were just added:
   ```bash
   vercel redeploy <deployment-url> --scope canvas-classrooms-projects
   ```

## Production Deployment
- **URL**: https://canvas-classroom.vercel.app
- **Latest deployment**: Check Vercel dashboard for status

