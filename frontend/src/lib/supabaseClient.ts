import { createClient } from '@supabase/supabase-js';
import { env, validateEnv } from './env';

// IMPORTANT:
// Only validate environment variables on the server (Node.js).
// This prevents runtime errors in the browser, since process.env is not available at runtime in client bundles.
// See: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
if (typeof window === 'undefined') {
  validateEnv();
}

export const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_KEY!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}); 