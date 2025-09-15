// src/scripts/seed-admin.ts
// Run this script to create your first admin user
// Usage: npx tsx src/scripts/seed-admin.ts

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedInitialAdmin() {
  try {
    console.log('🌱 Seeding initial admin user...');

    // Default admin credentials (change these!)
    const defaultAdmin = {
      username: 'masterprima_admin',
      email: 'admin@masterprima.co.id',
      password: 'MasterPrima2024!',
      is_admin: true,
    };

    // Check if any admin users already exist
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin')
      .select('id')
      .limit(1);

    if (checkError) {
      throw new Error(`Database check failed: ${checkError.message}`);
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('⚠️  Admin users already exist. Skipping seed.');
      console.log('💡 Use the dashboard to manage existing users.');
      return;
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(defaultAdmin.password, 12);

    // Create the initial admin user
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin')
      .insert({
        username: defaultAdmin.username,
        email: defaultAdmin.email,
        password: hashedPassword,
        is_admin: defaultAdmin.is_admin,
        auth_provider: 'email',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, username, email, is_admin, created_at')
      .single();

    if (insertError) {
      throw new Error(`Failed to create admin user: ${insertError.message}`);
    }

    console.log('✅ Initial admin user created successfully!');
    console.log('📋 Details:');
    console.log(`   Username: ${newAdmin.username}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Admin: ${newAdmin.is_admin ? 'Yes' : 'No'}`);
    console.log(`   Created: ${newAdmin.created_at}`);
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log(`   Username/Email: ${defaultAdmin.username} or ${defaultAdmin.email}`);
    console.log(`   Password: ${defaultAdmin.password}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change these credentials immediately after first login!');
    console.log('🌐 Login URL: /auth-mp-secure-2024/login');

    // Log the creation activity
    await supabase.from('admin_activity_log').insert({
      admin_id: newAdmin.id,
      action_type: 'INITIAL_SETUP',
      table_name: 'admin',
      record_id: newAdmin.id,
      changes: {
        action: 'initial_admin_created',
        username: newAdmin.username,
        email: newAdmin.email,
        setup_method: 'database_seeder',
      },
      ip_address: 'localhost',
      created_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeder
seedInitialAdmin()
  .then(() => {
    console.log('🎉 Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });