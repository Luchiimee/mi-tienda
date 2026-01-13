// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ShopProvider } from './context/ShopContext'; 

const inter = Inter({ subsets: ['latin'] })

// 🛠️ CONFIGURACIÓN SEO OPTIMIZADA
export const metadata: Metadata = {
  title: {
    default: 'Snappy | Crea tu Tienda Online en Minutos',
    template: '%s | Snappy', // Esto hará que otras páginas se vean como "Login | Snappy"
  },
  description: 'La plataforma ideal para Showrooms y Emprendedores. Crea tu catálogo digital, menú o tienda online sin comisiones y vende por WhatsApp.',
  keywords: ['tienda online', 'catalogo digital', 'showroom', 'emprendedores', 'menu qr', 'sin comisiones', 'vender por whatsapp'],
  icons: {
    icon: '/favicon.ico', // Asegúrate de tener este archivo en la carpeta "public" o "app"
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png', // Opcional: si tienes un icono para iPhone
  },
  openGraph: {
    title: 'Snappy | Tu Negocio en un Link',
    description: 'Olvídate de webs difíciles. Carga tus productos y vende por WhatsApp.',
    url: 'https://snappy.uno',
    siteName: 'Snappy',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ShopProvider>
          {children}
        </ShopProvider>
      </body>
    </html>
  )
}