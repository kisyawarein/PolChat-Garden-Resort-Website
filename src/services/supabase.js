import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '')
	.trim()
	.replace(/\/rest\/v1\/?$/, '')
	.replace(/\/+$/, '')

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

