#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdmin(email, password) {
  try {
    console.log(`Creating admin user: ${email}`);

    // Create user with admin client
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error('Error creating user:', error.message);
      process.exit(1);
    }

    if (!data.user) {
      console.error('No user data returned');
      process.exit(1);
    }

    console.log('✓ User created successfully');
    console.log(`  ID: ${data.user.id}`);
    console.log(`  Email: ${data.user.email}`);

    // Create a default organization for the admin user
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([
        {
          name: `${email.split('@')[0]}'s Organization`,
          slug: `org-${data.user.id.substring(0, 8)}`,
          owner_id: data.user.id,
          settings: {},
        },
      ])
      .select()
      .single();

    if (orgError) {
      console.warn('Warning: Could not create organization:', orgError.message);
    } else if (org) {
      console.log('✓ Organization created');
      console.log(`  Name: ${org.name}`);
      console.log(`  Slug: ${org.slug}`);
    }

    console.log('\nAdmin user is ready to use!');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

const email = process.argv[2] || 'coinkrazy26@gmail.com';
const password = process.argv[3] || 'admin123';

createAdmin(email, password);
