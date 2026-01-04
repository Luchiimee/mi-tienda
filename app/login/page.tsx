'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // Alternar entre Login y Registro
  const [msg, setMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    if (isRegister) {
      // --- REGISTRO ---
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setMsg(error.message);
      } else {
        setMsg('¡Cuenta creada! Revisa tu email para confirmar o inicia sesión si no requiere confirmación.');
        // En desarrollo local a veces entra directo, en prod requiere confirmar email por defecto
        if (data.session) router.push('/admin');
      }
    } else {
      // --- LOGIN ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMsg('Error: ' + error.message);
      } else {
        router.push('/admin'); // Si entra bien, vamos al Admin
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', fontFamily:'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'white', padding: 40, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        <div style={{textAlign:'center', marginBottom:30}}>
            <h1 style={{margin:0, fontSize:24}}>{isRegister ? 'Crear Cuenta 🚀' : 'Iniciar Sesión 👋'}</h1>
            <p style={{color:'#666', fontSize:14}}>Administra tu tienda desde aquí</p>
        </div>

        <form onSubmit={handleAuth} style={{display:'flex', flexDirection:'column', gap:15}}>
            <input 
                type="email" 
                placeholder="Tu Email" 
                value={email} onChange={e => setEmail(e.target.value)}
                style={{padding:12, borderRadius:8, border:'1px solid #ddd', fontSize:14}}
                required
            />
            <input 
                type="password" 
                placeholder="Contraseña" 
                value={password} onChange={e => setPassword(e.target.value)}
                style={{padding:12, borderRadius:8, border:'1px solid #ddd', fontSize:14}}
                required
            />

            {msg && <div style={{color:'red', fontSize:13, textAlign:'center'}}>{msg}</div>}

            <button disabled={loading} style={{padding:12, borderRadius:8, border:'none', background:'#3b82f6', color:'white', fontWeight:'bold', cursor:'pointer', marginTop:10}}>
                {loading ? 'Cargando...' : (isRegister ? 'Registrarme' : 'Entrar')}
            </button>
        </form>

        <div style={{marginTop:20, textAlign:'center', fontSize:13, color:'#666'}}>
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <span 
                onClick={() => setIsRegister(!isRegister)} 
                style={{color:'#3b82f6', fontWeight:'bold', cursor:'pointer', marginLeft:5}}
            >
                {isRegister ? 'Inicia Sesión' : 'Regístrate gratis'}
            </span>
        </div>

      </div>
    </div>
  );
}