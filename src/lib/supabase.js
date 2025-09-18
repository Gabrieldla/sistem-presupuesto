import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://decigqwopvoonmbhvmcn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY2lncXdvcHZvb25tYmh2bWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjA4MjYsImV4cCI6MjA3MzY5NjgyNn0.ykzy6selTiR5cZe1pvNoniPRBegr5pxyOp8L0n3uyI8'

export const supabase = createClient(supabaseUrl, supabaseKey)