import { createClient } from '@supabase/supabase-js';

// Ya no usamos 'placeholder', ahora confiamos en que Vercel tiene los datos
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("❌ Faltan las variables de entorno de Supabase. Revisa Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);