'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Asegúrate de haber creado este archivo en el paso anterior
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Si en la URL viene ?mode=signup, mostramos registro. Si no, login.
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setIsSignUp(true);
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // --- REGISTRO ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Si se registra bien, creamos su perfil en la tabla 'profiles' (la que creamos en SQL)
        if (data.user) {
             /* NOTA: Supabase a veces tarda un milisegundo en crear el user auth.
                Idealmente esto se hace con "Triggers" en la base de datos, 
                pero para empezar lo haremos aquí manual.
             */
             await supabase.from('profiles').insert([
                 { id: data.user.id, email: email, plan_type: 'trial', role: 'user' }
             ]);
             
             // También le creamos una tienda por defecto vacía
             await supabase.from('shops').insert([
                 { owner_id: data.user.id, slug: `tienda-${Date.now()}`, nombre_negocio: 'Mi Tienda Snappy' }
             ]);
        }

        alert('¡Cuenta creada! Revisa tu correo para confirmar o inicia sesión.');
        setIsSignUp(false); // Pasamos a login
      } else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Si entra bien, lo mandamos al panel
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f6f9', fontFamily: 'sans-serif' }}>
      
      {/* Logo Snappy */}
      <div style={{ marginBottom: 30, textAlign: 'center' }}>
         <div style={{ fontSize: '40px' }}>⚡</div>
         <h1 style={{ margin: '10px 0', color: '#2c3e50', fontWeight: 800 }}>Snappy</h1>
      </div>

      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <h2 style={{ margin: '0 0 20px 0', color: '#333', textAlign: 'center' }}>
          {isSignUp ? 'Crear cuenta gratis' : 'Bienvenido de nuevo'}
        </h2>

        {error && (
            <div style={{background:'#ffebee', color:'#c62828', padding:'10px', borderRadius:'8px', fontSize:'13px', marginBottom:'20px', textAlign:'center'}}>
                {error}
            </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>EMAIL</label>
            <input 
                type="email" required 
                value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
                placeholder="ejemplo@correo.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>CONTRASEÑA</label>
            <input 
                type="password" required 
                value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
                placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            style={{ 
                marginTop: '10px', padding: '15px', borderRadius: '8px', border: 'none', 
                background: '#3498db', color: 'white', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px',
                opacity: loading ? 0.7 : 1
            }}>
            {loading ? 'Procesando...' : (isSignUp ? 'Registrarme en Snappy' : 'Iniciar Sesión')}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#7f8c8d' }}>
          {isSignUp ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}
          <span 
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            style={{ color: '#3498db', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}>
            {isSignUp ? 'Ingresar' : 'Crear cuenta'}
          </span>
        </div>

      </div>
      
      <Link href="/" style={{marginTop: 30, color:'#999', fontSize:13, textDecoration:'none'}}>← Volver al inicio</Link>
    </div>
  );
}