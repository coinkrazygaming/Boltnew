# Neon PostgreSQL Setup Guide

Your Neon database is now connected! Here's how to set it up.

## Connection Details

- **Host**: ep-aged-salad-a4vglsoy-pooler.us-east-1.aws.neon.tech
- **Database**: neondb
- **User**: neondb_owner
- **Connection String**: Set in `DATABASE_URL` environment variable

## Option 1: Run Migrations via Neon Web Console (Easiest)

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project and database
3. Click **SQL Editor**
4. Paste the entire contents of `supabase/migrations/001_create_tables.sql`
5. Click **Execute** or **Run**

This will create all tables:
- organizations
- organization_members
- workspaces
- projects
- project_files

## Option 2: Run Migrations via psql CLI

```bash
psql postgresql://neondb_owner:npg_mHwP1BDZEb8l@ep-aged-salad-a4vglsoy-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require -f supabase/migrations/001_create_tables.sql
```

## Option 3: Use a Database Client

1. **DBeaver** (free, recommended)
   - Download: https://dbeaver.io
   - New Connection → PostgreSQL
   - Paste your connection string details

2. **PgAdmin** (free, web-based)
   - Create new server with your connection details

Then run the migration SQL file.

## Verify Setup

After running migrations, verify all tables were created:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- organizations
- organization_members
- workspaces
- projects
- project_files

## Using with the App

The app currently uses Supabase as an ORM. To use Neon directly, you have two options:

### Option A: Use Neon with Supabase Dashboard (Recommended)
1. In Supabase, go to Settings → Databases
2. Configure external database connection to Neon
3. The app will continue working with Supabase API

### Option B: Migrate Backend to Direct PostgreSQL
1. Install Prisma or node-postgres
2. Create a new database connection layer
3. Update server routes to use direct PostgreSQL queries

For now, the app still uses Supabase. You can:
- Run the migrations on Neon
- Keep the Supabase API integration
- Later switch to direct PostgreSQL if needed

## Quick Start

1. **Create tables in Neon** using Option 1 (Neon Web Console) - this is the fastest
2. **Keep using Supabase** for API layer
3. **Database is ready** for production use

Questions? Check the migration file: `supabase/migrations/001_create_tables.sql`
