import { createClient } from '@supabase/supabase-js';

function hasUsableValue(value: string | undefined) {
  return Boolean(value && value !== 'undefined' && value !== 'null');
}

const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(
  hasUsableValue(configuredSupabaseUrl) && hasUsableValue(configuredSupabaseAnonKey),
);

const supabaseUrl = hasSupabaseConfig ? configuredSupabaseUrl! : 'https://demo.polyhedge.local';
const supabaseAnonKey = hasSupabaseConfig ? configuredSupabaseAnonKey! : 'demo-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
