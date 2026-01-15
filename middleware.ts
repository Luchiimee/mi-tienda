import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Crear una respuesta inicial vacía que luego modificaremos
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Crear el cliente de Supabase para el contexto del servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Leer todas las cookies de la petición entrante
        getAll() {
          return request.cookies.getAll()
        },
        // Escribir cookies (Tokens de sesión nuevos o refrescados)
        setAll(cookiesToSet) {
          // A. Actualizar las cookies en la PETICIÓN (Request)
          // Esto permite que los Server Components vean la sesión actualizada inmediatamente
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )

          supabaseResponse = NextResponse.next({
            request,
          })

          // B. Actualizar las cookies en la RESPUESTA (Response)
          // Esto persiste la sesión en el navegador del usuario
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. IMPORTANTE: Refrescar la sesión
  // Al llamar a getUser(), Supabase verifica si el token es válido.
  // Si expiró, intenta usar el refresh_token y ejecuta el método 'setAll' de arriba
  // para guardar las nuevas credenciales.
  await supabase.auth.getUser()

  // 4. Retornar la respuesta con las cookies actualizadas
  return supabaseResponse
}

// Configuración para evitar que el middleware corra en archivos estáticos o imágenes
export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono)
     * - Extensiones comunes de imágenes (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}