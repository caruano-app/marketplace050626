import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);

export const supabase = supabaseInstance;
export const createSupabaseBrowserClient = () => supabaseInstance;
export default supabaseInstance;
