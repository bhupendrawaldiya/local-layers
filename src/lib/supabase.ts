
// This file is deprecated. Use the client from @/integrations/supabase/client instead.
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Creating a typed client that allows access to tables not yet in the generated types
export const supabase = supabaseClient;

// For TypeScript, declare that these tables exist and can be accessed
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    from(table: 'notifications'): any;
    from(table: 'profiles'): any;
  }
}
