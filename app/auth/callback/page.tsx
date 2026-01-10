'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Supabase detecta automáticamente el código que manda Google en la URL.
    // 2. Escuchamos cuando la sesión se crea exitosamente.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        // ¡Login exitoso! Te mandamos al panel de control.
        router.push('/admin'); 
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ fontSize: '40px' }}>🔄</div>
      <h2 style={{ color: '#333' }}>Verificando tu cuenta...</h2>
      <p style={{ color: '#666' }}>Estamos conectando con Google, espera un momento.</p>
    </div>
  );
}