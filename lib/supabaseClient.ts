import { createClient } from '@supabase/supabase-js';

// LEER VARIABLES DE ENTORNO
// Usamos '||' para poner un valor por defecto si la variable no existe durante el build.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// CREAR EL CLIENTE
// Ahora createClient nunca recibirá "undefined" y no explotará el build.
export const supabase = createClient(supabaseUrl, supabaseKey);