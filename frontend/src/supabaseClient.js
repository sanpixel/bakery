import { createClient } from '@supabase/supabase-js';

let supabase;
let configPromise = null;

// Create mock client initially
const createMockClient = () => ({
  auth: {
    signInWithOAuth: () => Promise.reject(new Error('Supabase not configured')),
    signOut: () => Promise.resolve(),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.reject(new Error('Supabase not configured')),
    update: () => Promise.reject(new Error('Supabase not configured')),
    delete: () => Promise.reject(new Error('Supabase not configured'))
  })
});

supabase = createMockClient();

// Function to initialize Supabase client with config from backend
const initializeSupabase = async () => {
  if (configPromise) return configPromise;
  
  configPromise = (async () => {
    try {
      console.log('Fetching Supabase config from backend...');
      const response = await fetch('/api/config');
      const config = await response.json();
      
      console.log('DEBUG: Config from backend =', config);
      
      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error('Missing Supabase configuration from backend');
      }
      
      supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
      console.log('Supabase client created successfully from backend config');
      
      return { supabase, config };
    } catch (error) {
      console.error('Failed to fetch config or create Supabase client:', error);
      supabase = createMockClient();
      return { supabase, config: null };
    }
  })();
  
  return configPromise;
};

// Get Supabase client (async)
const getSupabase = async () => {
  await initializeSupabase();
  return supabase;
};

export { supabase, getSupabase, initializeSupabase };