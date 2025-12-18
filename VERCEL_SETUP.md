# Vercel Deployment Setup Guide

## Issues Fixed

### 1. ✅ X-Frame-Options Updated
Changed from `DENY` to `SAMEORIGIN` in `vercel.json` to allow Scratch iframe to load.

### 2. ⚠️ Supabase Environment Variables (ACTION REQUIRED)

You need to add your Supabase environment variables to Vercel for the deployment to work.

## Steps to Configure Vercel Environment Variables

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (canvasclassroom)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |

**To get these values:**
- Go to your [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to **Settings** → **API**
- Copy:
  - **Project URL** → `VITE_SUPABASE_URL`
  - **Project API keys** → **anon/public** → `VITE_SUPABASE_ANON_KEY`

5. After adding the variables, click **Save**
6. **Redeploy your project** (this is crucial!):
   - Go to **Deployments** tab
   - Click the three dots `...` on your latest deployment
   - Click **Redeploy**
   - Select **Use existing Build Cache** (optional, but faster)

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted

# Redeploy
vercel --prod
```

## Verification

After redeploying, check your deployment:

1. Open your Vercel deployment URL
2. Open browser console (F12)
3. Look for the Supabase configuration log:
   ```
   🔧 Supabase Config: {
     url: "https://yourproject.supabase.co...",
     envKeys: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", ...]
   }
   ```

4. If you still see `url: 'MISSING'`, the environment variables aren't set correctly
5. If Scratch still won't load, check the console for frame-related errors

## Common Issues

### Issue: Environment variables not taking effect
**Solution:** You must redeploy after adding environment variables. Environment variables are only injected during the build process.

### Issue: Still getting 400 errors
**Solution:** 
1. Verify your Supabase URL and anon key are correct
2. Check your Supabase project is active
3. Verify RLS policies allow access
4. Check browser console for detailed error messages

### Issue: Scratch still won't load
**Solution:**
1. Clear browser cache and hard refresh (Ctrl+Shift+R)
2. Check the Network tab in DevTools for failed requests
3. Verify `/scratch-editor.html` and `/scratch-gui/index.html` are accessible

## Security Note

✅ **Safe to commit:** The updated `vercel.json` file (with SAMEORIGIN)
❌ **Never commit:** Your actual Supabase credentials (they should only be in Vercel dashboard and local `.env`)

