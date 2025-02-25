
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qbicqkcuzdgkcsauxtch.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaWNxa2N1emRna2NzYXV4dGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NjYxMzQsImV4cCI6MjA1NjA0MjEzNH0.RIxKIQMrdckCOeBUdZQrEFxbZM0VU3889XhIzvqecbY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
