# Supabase Integration Setup Guide

This guide will help you set up Supabase for your CanvasClassroom application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Step 1: Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the SQL Editor
4. Run the SQL script to create all necessary tables

This will create the following tables:
- `classes` - Class/period management
- `students` - Student information
- `enrollments` - Student-class relationships
- `units` - Curriculum units
- `lessons` - Lesson plans
- `submissions` - Student submissions
- `rubrics` - Grading rubrics
- `announcements` - Class announcements
- `help_requests` - Student help requests
- `accommodations` - Student accommodations
- `feedback_templates` - Teacher feedback templates

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (this is your `VITE_SUPABASE_URL`)
3. Copy your **anon/public key** (this is your `VITE_SUPABASE_ANON_KEY`)

## Step 3: Configure Environment Variables

Create a `.env` file in the root of your project with the following:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with the values from Step 2.

**Important:** Make sure `.env` is in your `.gitignore` file to keep your credentials secure.

## Step 4: Restart Your Development Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## What's Been Integrated

All mock data has been replaced with real Supabase operations:

### ✅ Classes
- Create, read, update, delete classes
- Automatic class code generation
- Load classes on app startup

### ✅ Students & Enrollments
- Create and manage students
- Handle student enrollments
- CSV import functionality
- Student-class relationships

### ✅ Units & Lessons
- Create, update, delete units and lessons
- Reorder units and lessons
- Lock/unlock units
- Sequential mode toggle
- All changes persist to Supabase

### ✅ Submissions
- Create draft submissions
- Submit completed work
- Update progress in real-time
- Grade submissions with feedback
- Track submission history

### ✅ Announcements
- Create and manage announcements
- Schedule announcements
- Target specific students

### ✅ Help Requests
- Create help requests
- Update request status (pending → in-progress → resolved)
- Load requests for each class

### ✅ Feedback Templates
- Create and manage feedback templates
- Load templates from Supabase

## Authentication Note

Currently, the app uses a hardcoded `teacherId` of `'teacher1'`. In production, you should:

1. Implement Supabase Authentication
2. Get the authenticated user's ID from the auth context
3. Replace all instances of `'teacher1'` with the actual user ID

## Row Level Security (RLS)

The schema includes basic RLS policies that allow all operations. For production, you should:

1. Implement proper authentication
2. Create more restrictive RLS policies based on user roles
3. Ensure students can only access their own data
4. Ensure teachers can only access their own classes

## Troubleshooting

### "Supabase URL and/or Anon Key not found"
- Make sure your `.env` file exists in the project root
- Verify the variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after creating/updating `.env`

### Database errors
- Verify you've run the SQL schema script
- Check that all tables were created successfully
- Verify your RLS policies allow the operations you're trying to perform

### Data not loading
- Check the browser console for errors
- Verify your Supabase project is active
- Check that your API keys are correct

## Next Steps

1. Set up Supabase Authentication for user login
2. Implement proper RLS policies
3. Add error handling and loading states
4. Consider adding real-time subscriptions for live updates
5. Set up database backups

