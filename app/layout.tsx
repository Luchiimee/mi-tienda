// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ShopProvider } from './context/ShopContext'; // Importamos el contexto

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Snappy',
  description: 'Constructor de catálogos en tiempo real',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ShopProvider> {/* Envolvemos todo aquí */}
          {children}
        </ShopProvider>
      </body>
    </html>
  )
}