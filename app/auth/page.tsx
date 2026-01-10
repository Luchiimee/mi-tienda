'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState(''); // Nuevo estado para teléfono
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: nombre,
            last_name: apellido,
            phone: telefono 
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Crear entrada en la tabla 'shops'
        // Usamos upsert para evitar errores si por alguna razón ya se creó
        const { error: dbError } = await supabase.from('shops').upsert([
          {
            user_id: authData.user.id,
            owner_id: authData.user.id, // Compatibilidad
            email: email,
            nombre_dueno: nombre,
            apellido_dueno: apellido,
            telefono_dueno: telefono, // Guardamos el teléfono
            nombre_negocio: 'Mi Tienda',
            plan: 'none',
            subscription_status: 'trial',
            trial_start_date: new Date().toISOString(),
            slug_tienda: `tienda-${Date.now()}` // Slug temporal único
          }
        ]);

        if (dbError) {
            console.error("Error DB:", dbError);
            // No bloqueamos el registro si falla la DB, el context lo arreglará después
        }

        // 3. Éxito: Redirigir
        alert('✅ ¡Cuenta creada con éxito! Bienvenido.');
        router.push('/admin'); // O '/configuracion' si prefieres
      }

    } catch (error: any) {
      console.error('Error en registro:', error);
      setErrorMsg(error.message || 'Ocurrió un error al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>Crear Cuenta 🚀</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>Completa tus datos para empezar</p>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Fila Nombre y Apellido (Corregida) */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                    <input
                        type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required
                        style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <input
                        type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required
                        style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>
            </div>

            <input
                type="tel" placeholder="Teléfono (Ej: 1131159903)" value={telefono} onChange={(e) => setTelefono(e.target.value)} required
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />

            <input
                type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />

            <input
                type="password" placeholder="Contraseña (mín 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />

            {errorMsg && <div style={{ color: '#ef4444', fontSize: '13px', background: '#fef2f2', padding: '8px', borderRadius: '6px' }}>⚠️ {errorMsg}</div>}

            <button 
                type="submit" disabled={loading}
                style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', opacity: loading ? 0.7 : 1 }}
            >
                {loading ? 'Procesando...' : 'Registrarme Gratis'}
            </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>O continúa con</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        </div>

        <button 
            onClick={handleGoogleLogin}
            style={{ width: '100%', padding: '10px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#334155', fontWeight: '500' }}
        >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '18px' }} />
            Google
        </button>

        <p style={{ marginTop: '25px', fontSize: '13px', color: '#64748b' }}>
            ¿Ya tienes cuenta? <Link href="/login" style={{ color: '#6366f1', fontWeight: 'bold', textDecoration: 'none' }}>Inicia Sesión</Link>
        </p>

      </div>
    </div>
  );
}