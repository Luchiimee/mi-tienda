import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Si venimos de "next" (ej: /admin), usamos eso. Si no, al /admin por defecto.
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    // 1. Creamos la respuesta de redirección PRIMERO (para poder pegarle las cookies después)
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // AQUÍ ESTÁ LA MAGIA: Escribimos en el 'response', no en el 'request'
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            // Para borrar, simplemente seteamos la cookie vacía en el 'response'
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )
    
    // 2. Intercambiamos el código por la sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 3. Devolvemos la respuesta que YA tiene las cookies pegadas
      return response
    }
  }

  // Si falló, mandar a una página de error
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}