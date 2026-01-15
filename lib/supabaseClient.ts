import { createBrowserClient } from '@supabase/ssr'

// Esta función crea un cliente especial que sabe leer/escribir las cookies
// que el Middleware gestiona. Así la sesión se mantiene sincronizada.
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Exportamos la instancia 'supabase' igual que antes para que
// el resto de tu aplicación (ShopContext, Login, etc.) siga funcionando sin cambios.
export const supabase = createClient()