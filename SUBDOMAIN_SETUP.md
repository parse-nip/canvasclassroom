# Subdomain Setup Guide

This app uses subdomain routing:
- **canvasclassroom.com** - Landing page (HomePage)
- **app.canvasclassroom.com** - Application (Teacher/Student dashboards)

## Vercel Configuration

### 1. Add Domain in Vercel Dashboard

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add both domains:
   - `canvasclassroom.com`
   - `app.canvasclassroom.com`

### 2. DNS Configuration

Configure your DNS records:

**For canvasclassroom.com:**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel's IP - check Vercel dashboard for current IP)
```

**For app.canvasclassroom.com:**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com (or use Vercel's provided CNAME)
```

Alternatively, you can use Vercel's automatic DNS configuration if your domain registrar supports it.

### 3. Vercel Project Settings

The `vercel.json` file is already configured to handle both subdomains. Both will serve the same React app, but the app will detect which subdomain it's on and show the appropriate content.

## How It Works

### Root Domain (canvasclassroom.com)
- Shows only the **HomePage** component
- Login/Launch buttons redirect to `app.canvasclassroom.com`
- All app routes redirect to the app subdomain

### App Subdomain (app.canvasclassroom.com)
- Shows the full application (Teacher/Student dashboards)
- Handles all authenticated routes
- Root path (`/`) redirects to `/auth` if not logged in, or appropriate dashboard if logged in

## Local Development

For local development, the app defaults to the "app subdomain" behavior. To test the homepage:

1. Set environment variable in `.env`:
   ```
   VITE_APP_SUBDOMAIN=false
   ```

2. Or modify the subdomain detection logic in `src/App.tsx` if needed.

## Testing

After deployment:
1. Visit `https://canvasclassroom.com` - should show landing page
2. Click "Sign In" or "Launch Dashboard" - should redirect to `https://app.canvasclassroom.com/auth`
3. Visit `https://app.canvasclassroom.com` directly - should show auth page or dashboard

## Troubleshooting

### Subdomain not working
- Check DNS propagation: `dig app.canvasclassroom.com`
- Verify domain is added in Vercel dashboard
- Check Vercel deployment logs

### Wrong content showing
- Clear browser cache
- Check browser console for errors
- Verify `vercel.json` is deployed correctly

