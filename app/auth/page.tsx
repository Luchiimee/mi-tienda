'use client';

import { useState, useEffect, Suspense } from 'react'; // <--- IMPORTANTE: Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// 1. CREAMOS UN COMPONENTE INTERNO CON LA LÓGICA (Lo que antes era tu página)
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Esto es lo que causaba el error sin Suspense
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Efecto para leer errores de la URL (si los hubiera)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) alert('Error de autenticación: ' + error);
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/admin');
      } else {
        const { error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: { emailRedirectTo: `${location.origin}/auth/callback` }
        });
        if (error) throw error;
        alert('Revisa tu email para confirmar la cuenta.');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: 400 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 20, color: '#333' }}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h1>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: 10, borderRadius: 5, border: '1px solid #ddd' }}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ padding: 10, borderRadius: 5, border: '1px solid #ddd' }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: 10, borderRadius: 5, border: 'none', background: '#3498db', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: '#3498db', cursor: 'pointer', marginLeft: 5, fontWeight: 'bold' }}
          >
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </span>
        </p>
      </div>
    </div>
  );
}

// 2. EXPORTAMOS LA PÁGINA "ENVUELTA" EN SUSPENSE
export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{display:'flex', justifyContent:'center', marginTop:50}}>Cargando autenticación...</div>}>
      <AuthContent />
    </Suspense>
  );
}