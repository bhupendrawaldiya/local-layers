// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qbicqkcuzdgkcsauxtch.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaWNxa2N1emRna2NzYXV4dGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NjYxMzQsImV4cCI6MjA1NjA0MjEzNH0.RIxKIQMrdckCOeBUdZQrEFxbZM0VU3889XhIzvqecbY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);