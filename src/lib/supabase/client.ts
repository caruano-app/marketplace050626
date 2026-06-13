import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Exportação nomeada correta que o site todo espera
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
