import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://krlfwtwcaunxcitfzrpq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_k-FPtTAKnjKWn_ocJr31oA_Slt8pIPG'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
