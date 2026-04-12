# Connecting Supabase to Neon PostgreSQL

This guide shows how to use Supabase's API layer with Neon as your actual database backend.

## Why This Approach?

- ✅ Keep all existing Supabase API code (no app changes needed)
- ✅ Use Neon for actual data storage
- ✅ Get Supabase's built-in features (Auth, RLS policies, etc)
- ✅ Full control over your database

## Step 1: Create Tables in Neon

1. Go to your **Neon Console**: https://console.neon.tech
2. Click **SQL Editor** on the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of this file: `supabase/migrations/001_create_tables.sql`
5. Click **Execute** (green play button)

Expected result: "Successfully created tables and policies"

## Step 2: Connect Neon to Supabase (Your Supabase Project)

Go to your **Supabase Project Dashboard**: https://app.supabase.com

### A. Get Your Neon Connection String

From the Neon connection URL provided:
```
postgresql://neondb_owner:npg_mHwP1BDZEb8l@ep-aged-salad-a4vglsoy-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Extract:
- **Host**: `ep-aged-salad-a4vglsoy-pooler.us-east-1.aws.neon.tech`
- **Port**: `5432` (default)
- **Database**: `neondb`
- **User**: `neondb_owner`
- **Password**: `npg_mHwP1BDZEb8l`

### B. In Supabase, Go to Settings → Database

1. Click your project name in the top left
2. Go to **Settings** (bottom left gear icon)
3. Click **Database** in the left sidebar
4. Scroll down to **Connection Info**

You'll see your current Supabase database details. You need to either:

**Option A: Use Supabase's Database Switcher (Easiest)**
- Click **Database** settings
- Look for "Connect external database" or similar option
- Enter your Neon connection details
- Test connection and save

**Option B: Manual Connection String Update**
- If your hosting provider allows, update the DATABASE_URL environment variable
- Change it from Supabase's default to your Neon connection string

### C. Test the Connection

In Supabase SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see your newly created tables:
- organizations
- organization_members
- workspaces
- projects
- project_files

## Step 3: Verify App Still Works

1. Go to your app at: https://d81776a468d1485db70a00e3c6142eac-main.builderio.xyz/auth
2. Sign in with your Supabase account
3. Go to Dashboard
4. Try creating an organization
5. Check Neon to confirm data was saved:

In Neon Console SQL Editor:
```sql
SELECT * FROM organizations;
```

## Step 4: Environment Variables

Your app already has these set:
- ✓ `VITE_SUPABASE_URL` 
- ✓ `VITE_SUPABASE_ANON_KEY`
- ✓ `SUPABASE_SERVICE_KEY`
- ✓ `DATABASE_URL` (points to Neon)

No changes needed!

## Troubleshooting

**"Tables don't exist" error**
- Make sure you ran the migration SQL in Neon
- Check that the tables are visible in Neon Console

**"Connection refused"**
- Verify your Neon connection string is correct
- Check that you're using the pooler URL (with `-pooler` in the hostname)
- Ensure SSL mode is enabled

**"Authentication failed"**
- Double-check the username and password
- Make sure there are no extra spaces in the connection string

## Next Steps

1. ✅ Run migration on Neon (the SQL file)
2. ✅ Connect Supabase to Neon's database
3. ✅ Test by creating organizations in the app
4. ✅ Done! Your app now uses Neon for persistent storage

Questions? The migration file includes all table definitions and security policies.
