import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://khqjmfqiozratcefcbrn.supabase.co'
const supabaseAnonKey = 'sb_publishable_u79xXjgd8Wx9QeC49P_6CQ_fawnLvPg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
