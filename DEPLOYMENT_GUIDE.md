# Studio Booking App - Deployment Guide

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** (free tier available)
3. **Vercel Account** (free tier available)
4. **Git** installed on your machine

---

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project Name**: `studio-booking-app` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Wait for the project to be created (~2 minutes)

### 1.2 Get Your Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 1.3 Create Database Tables
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase_schema.sql` from this project
4. Paste into the SQL editor
5. Click "Run" or press `Ctrl+Enter` (Cmd+Enter on Mac)
6. Verify all tables are created successfully

### 1.4 Add Initial Data (Optional)
You can add initial staff members and equipment via the SQL Editor:

```sql
-- Add initial staff
INSERT INTO staff (name, role, is_available) VALUES
('Admin User', 'Manager', true),
('Staff Member 1', 'Receptionist', true);

-- Add initial equipment
INSERT INTO equipment (name, type, total_quantity, available_quantity, status) VALUES
('Yoga Mat', 'mat', 20, 20, 'available'),
('Resistance Band', 'accessory', 15, 15, 'available'),
('Foam Roller', 'recovery', 10, 10, 'available');
```

---

## 🔐 Step 2: Configure Environment Variables

### 2.1 Local Development
1. In your project root, create or edit `.env` file:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace the placeholder values with your actual Supabase credentials

### 2.2 Vercel Deployment
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the same two variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 🚀 Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to your project
cd /path/to/studio-booking-app

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N (for first time)
# - Project name? studio-booking-app
# - Directory? ./
# - Override settings? N

# Deploy to production
vercel --prod
```

### Option B: Deploy via GitHub Integration

1. **Push your code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit - Studio Booking App"
git branch -M main
git remote add origin https://github.com/yourusername/studio-booking-app.git
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure project:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Add environment variables (from Step 2)
   - Click "Deploy"

---

## ✅ Step 4: Verify Deployment

1. After deployment, Vercel will provide a live URL (e.g., `https://studio-booking-app.vercel.app`)
2. Test all features:
   - Calendar view and booking creation
   - Studio map equipment status
   - Staff configuration settings
   - Complaints tracking
   - Session rescheduling and cancellation

---

## 🔧 Troubleshooting

### Error 101: Missing Supabase Credentials
**Cause**: Environment variables not set correctly
**Fix**: 
- Check `.env` file exists in project root
- Verify variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after adding `.env`
- For Vercel, ensure env vars are set in project settings

### Build Fails on Vercel
**Cause**: Missing dependencies or build errors
**Fix**:
- Run `npm run build` locally first to catch errors
- Check Node version compatibility (use Node 18+)
- Review Vercel deployment logs for specific errors

### Database Connection Issues
**Cause**: Incorrect Supabase credentials or RLS policies
**Fix**:
- Double-check URL and anon key
- Verify tables exist in Supabase dashboard
- Check Row Level Security policies allow access

### CORS Errors
**Cause**: Supabase project not configured for your domain
**Fix**:
- In Supabase dashboard, go to Settings → API
- Ensure your Vercel domain is added to allowed URLs

---

## 📊 Database Schema Overview

| Table | Purpose |
|-------|---------|
| `clients` | Stores client information (reusable) |
| `equipment` | Studio equipment inventory and status |
| `staff` | Staff members and availability |
| `settings` | App configuration (cancellation policy, capacity, etc.) |
| `sessions` | Booking sessions with all details |
| `complaints` | Client complaints and resolution tracking |
| `follow_ups` | Automated follow-up reminders |

---

## 🎯 Next Steps After Deployment

1. **Custom Domain**: Connect your custom domain in Vercel settings
2. **Authentication**: Implement Supabase Auth for staff login (optional)
3. **Email Notifications**: Set up Supabase Edge Functions for automated emails
4. **Analytics**: Add Vercel Analytics or Google Analytics
5. **Backups**: Enable daily backups in Supabase settings

---

## 📞 Support

For issues:
1. Check Supabase dashboard for database errors
2. Review Vercel deployment logs
3. Inspect browser console for frontend errors
4. Verify environment variables are correctly set

---

**Ready to deploy?** Follow the steps above and your Studio Booking App will be live in minutes! 🎉
