/**
 * GIFTESS - Supabase Configuration
 * Single source of truth for Supabase client
 * DO NOT recreate client elsewhere
 */

// Supabase Configuration
const SUPABASE_URL = 'https://xlthbshztxfxhxvwequi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdGhic2h6dHhmeGh4dndlcXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDQwNTgsImV4cCI6MjA4NzYyMDA1OH0.c1wRdu32y0hCTuYEglVRuiY_nQwRFQrrH4vVjCYNkOM';

// Initialize Supabase client (singleton)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export client
window.supabase = supabaseClient;

// Helper: Get current user
async function getCurrentUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
}

// Helper: Check if user is admin
async function isAdmin() {
    const user = await getCurrentUser();
    if (!user) return false;
    
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
    
    return profile?.role === 'admin';
}

// Helper: Sign out
async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
        return false;
    }
    return true;
}

// Export helpers
window.getCurrentUser = getCurrentUser;
window.isAdmin = isAdmin;
window.signOut = signOut;

console.log('✅ Supabase initialized');
