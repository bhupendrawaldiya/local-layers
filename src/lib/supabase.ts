
import { createClient } from '@supabase/supabase-js'

// When properly connected to Supabase through Lovable, these values will be automatically injected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Make sure you have connected your project to Supabase through Lovable.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
