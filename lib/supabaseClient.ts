import { createClient } from '@supabase/supabase-js';

// --- ESTRATEGIA DEFENSIVA ---
// 1. Intentamos leer las variables reales.
// 2. Si no existen (por ejemplo durante el Build), usamos valores "falsos" para que no explote el error.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Solo mostramos advertencia en la consola si faltan, pero NO detenemos la app.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("⚠️ Build Warning: No se detectó SUPABASE_URL. Usando placeholder para evitar crash.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);