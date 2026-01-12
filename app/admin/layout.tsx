import type { Metadata } from 'next';

// ✅ Aquí sí funciona porque este archivo es de Servidor
export const metadata: Metadata = {
  title: 'Panel Editor | Snappy',
  description: 'Gestiona tu tienda, productos y diseño.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}