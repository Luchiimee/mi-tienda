'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  // Campos básicos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Campos extras para el registro
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');

  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // Alternar entre Login y Registro
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'error' | 'success'>('error');

  // --- FUNCIÓN PARA LOGIN CON GOOGLE ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
        setMsgType('error');
        setMsg(error.message);
        setLoading(false);
    }
    // Nota: Google redirige, así que no necesitamos setLoading(false) si sale bien
  };

  // --- FUNCIÓN PARA LOGIN/REGISTRO MANUAL ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setMsgType('error');

    try {
      if (isRegister) {
        // --- REGISTRO (CON NOMBRE, APELLIDO Y TEL) ---
        
        // Validación básica
        if (!nombre || !apellido || !telefono) {
            throw new Error("Por favor completa todos los campos (Nombre, Apellido y Teléfono)");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            // AQUÍ GUARDAMOS LOS DATOS EXTRAS EN SUPABASE:
            data: {
                first_name: nombre,
                last_name: apellido,
                phone: telefono, // Se guarda en user_metadata
            }
          },
        });

        if (error) throw error;

        // Si se crea el usuario pero NO hay sesión, es que requiere confirmar email
        if (data.user && !data.session) {
          setMsgType('success');
          setMsg('¡Cuenta creada! 📧 Revisa tu correo para confirmar tu cuenta antes de entrar.');
        } else if (data.session) {
          router.push('/admin'); 
        }

      } else {
        // --- LOGIN (SOLO EMAIL Y PASS) ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push('/admin'); 
      }
    } catch (error: any) {
      setMsgType('error');
      setMsg(error.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'white', padding: 40, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h1 style={{ margin: 0, fontSize: 24 }}>{isRegister ? 'Crear Cuenta 🚀' : 'Iniciar Sesión 👋'}</h1>
            <p style={{ color: '#666', fontSize: 14 }}>
                {isRegister ? 'Completa tus datos para empezar' : 'Administra tu tienda desde aquí'}
            </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            
            {/* CAMPOS SOLO VISIBLES EN REGISTRO */}
            {isRegister && (
                <>
                    <div style={{display:'flex', gap:10}}>
                        <input 
                            type="text" placeholder="Nombre" 
                            value={nombre} onChange={e => setNombre(e.target.value)}
                            style={{ flex:1, padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                            required={isRegister}
                        />
                        <input 
                            type="text" placeholder="Apellido" 
                            value={apellido} onChange={e => setApellido(e.target.value)}
                            style={{ flex:1, padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                            required={isRegister}
                        />
                    </div>
                    <input 
                        type="tel" placeholder="Teléfono / WhatsApp" 
                        value={telefono} onChange={e => setTelefono(e.target.value)}
                        style={{ padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                        required={isRegister}
                    />
                </>
            )}

            <input 
                type="email" placeholder="Tu Email" 
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                required
            />
            <input 
                type="password" placeholder="Contraseña" 
                value={password} onChange={e => setPassword(e.target.value)}
                style={{ padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                required
            />

            {/* Mensajes */}
            {msg && (
                <div style={{ 
                    color: msgType === 'error' ? '#e11d48' : '#16a34a',
                    backgroundColor: msgType === 'error' ? '#ffe4e6' : '#dcfce7',
                    padding: '10px', borderRadius: '6px', fontSize: 13, textAlign: 'center',
                    border: `1px solid ${msgType === 'error' ? '#fecdd3' : '#bbf7d0'}`
                }}>
                    {msg}
                </div>
            )}

            {/* BOTÓN PRINCIPAL */}
            <button disabled={loading} style={{ padding: 12, borderRadius: 8, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: 10, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Procesando...' : (isRegister ? 'Registrarme' : 'Entrar')}
            </button>

            {/* SEPARADOR */}
            <div style={{display:'flex', alignItems:'center', margin:'10px 0'}}>
                <div style={{flex:1, height:1, background:'#eee'}}></div>
                <span style={{padding:'0 10px', fontSize:12, color:'#999'}}>O continúa con</span>
                <div style={{flex:1, height:1, background:'#eee'}}></div>
            </div>

            {/* BOTÓN GOOGLE */}
            <button 
                type="button"
                onClick={handleGoogleLogin}
                style={{ 
                    padding: 12, borderRadius: 8, border: '1px solid #ddd', background: 'white', 
                    color: '#333', fontWeight: '500', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 
                }}
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{width:20, height:20}}/>
                Google
            </button>

        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#666' }}>
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <span 
                onClick={() => { setIsRegister(!isRegister); setMsg(''); }} 
                style={{ color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', marginLeft: 5 }}
            >
                {isRegister ? 'Inicia Sesión' : 'Regístrate gratis'}
            </span>
        </div>

      </div>
    </div>
  );
}