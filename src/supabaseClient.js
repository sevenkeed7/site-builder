import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sactjhvgtycnfahhsfsw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhY3RqaHZndHljbmZhaGhzZnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTk1MzYsImV4cCI6MjA4MTU3NTUzNn0.BUY8aOywqZfOdk4yspZVhGostiETmomGfaDRxhzfztE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
