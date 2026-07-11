const { createClient } = require('@supabase/supabase-js');
const url = 'https://qjkhsymtakawkqklopjk.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqa2hzeW10YWthd2txa2xvcGprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA2MTkzNSwiZXhwIjoyMDk4NjM3OTM1fQ.E2ZjlK6OC4gO0JCmHONBAGKyxYhAnClgTLInkzdLblY';
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function fix() {
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) { console.error('Auth error:', authError); return; }
  
  console.log(`Found ${users.length} users.`);
  
  if (users.length === 0) {
    console.log('No users found in auth.users!');
    return;
  }
  
  for (const u of users) {
    console.log(`Processing user ${u.email}...`);
    
    const { error: upsertErr } = await supabase.from('profiles').upsert({
      id: u.id,
      username: u.email.split('@')[0] + Math.floor(Math.random() * 1000),
      full_name: u.user_metadata?.full_name || 'Admin',
      platform_role: 'super_admin',
      account_status: 'active'
    }, { onConflict: 'id' });
    
    if (upsertErr) {
      console.error(`Failed to upsert profile for ${u.email}:`, upsertErr);
    } else {
      console.log(`Successfully made ${u.email} a super_admin!`);
    }
  }
}

fix();
