'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useShop } from '../context/ShopContext';
import Sidebar from '../components/Sidebar';

export default function ConfiguracionPage() {
  const { shopData, updateProfile, changePassword, lockTemplate } = useShop();
  const router = useRouter();

  const [newPass, setNewPass] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  
  // --- NUEVO ESTADO PARA CARGA DE PAGO ---
  const [loadingPago, setLoadingPago] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkUser();
  }, [router]);

  // --- FUNCIÓN PARA INICIAR SUSCRIPCIÓN ---
  const handleSubscribe = async () => {
      setLoadingPago(true);
      try {
          // 1. Llamamos a nuestra API
          const response = await fetch('/api/crear-suscripcion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: shopData.nombreAdmin + '@gmail.com' }) // Enviamos email (simulado o real)
          });
          
          const data = await response.json();

          if (data.url) {
              // 2. Redirigimos a Mercado Pago
              window.location.href = data.url;
          } else {
              alert('Error al generar link de pago');
          }
      } catch (error) {
          console.error(error);
          alert('Hubo un error de conexión');
      } finally {
          setLoadingPago(false);
      }
  };

  const handlePassChange = async () => { /* ... igual que antes ... */ 
    if (newPass.length < 6) return alert("Mínimo 6 caracteres.");
    setLoadingPass(true);
    const err = await changePassword(newPass);
    setLoadingPass(false);
    if (err) alert("Error: " + err.message);
    else { alert("¡Contraseña actualizada!"); setNewPass(''); }
  };

  const handleLock = async (tmpl: string) => { /* ... igual que antes ... */ 
    if (!tmpl) return;
    const success = await lockTemplate(tmpl);
    if (success) alert("✅ Plantilla confirmada exitosamente.");
  };

  const isSimple = shopData.plan === 'simple';

  return (
    <div className="contenedor-layout">
      <Sidebar activeTab="configuracion" />

      <main className="main-content" style={{ padding: '40px', overflowY: 'auto', background: '#f8fafc', width: '100%', minHeight: '100vh' }}>
        
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:30}}>
            <span style={{fontSize:28, color:'#94a3b8'}}>⚙️</span>
            <h1 style={{ margin: 0, color: '#1e293b', fontSize: 28, fontWeight: '800' }}>Configuración</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', alignItems:'start', width: '100%' }}>
            
            {/* 1. MIS DATOS (Igual que antes) */}
            <div style={{ background: 'white', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border:'1px solid #f1f5f9' }}>
                {/* ... (Contenido Mis Datos igual) ... */}
                <h3 style={{ marginTop: 0, fontSize: 16, color: '#334155', display:'flex', alignItems:'center', gap:8, marginBottom:25 }}>
                    👤 <span style={{fontWeight:'bold'}}>Mis Datos</span>
                </h3>
                <div style={{marginBottom:20}}>
                    <label style={{display:'block', fontSize:12, fontWeight:'bold', color:'#64748b', marginBottom:8}}>Nombre Completo</label>
                    <div style={{display:'flex', gap:10}}>
                        <input type="text" placeholder="Nombre" value={shopData.nombreDueno} onChange={e => updateProfile({ nombreDueno: e.target.value })} style={{flex:1, padding:12, border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none'}} />
                        <input type="text" placeholder="Apellido" value={shopData.apellidoDueno} onChange={e => updateProfile({ apellidoDueno: e.target.value })} style={{flex:1, padding:12, border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none'}} />
                    </div>
                </div>
                <div style={{marginBottom:25}}>
                    <label style={{display:'block', fontSize:12, fontWeight:'bold', color:'#64748b', marginBottom:8}}>Email de acceso</label>
                    <input type="text" value={shopData.nombreAdmin + '@gmail.com'} disabled style={{width:'100%', padding:12, border:'none', borderRadius:8, background:'#f1f5f9', color:'#94a3b8', fontSize:13}} />
                </div>
                <div style={{ border:'1px dashed #cbd5e1', padding: 20, borderRadius: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#475569', marginBottom: 10 }}>Cambiar Contraseña</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input type="password" placeholder="Nueva pass" value={newPass} onChange={e => setNewPass(e.target.value)} style={{ flex:1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize:13, outline:'none' }} />
                        <button onClick={handlePassChange} disabled={loadingPass} style={{ padding: '0 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize:12 }}>{loadingPass ? '...' : 'OK'}</button>
                    </div>
                </div>
            </div>

            {/* 2. PLAN & DISEÑO (Igual que antes) */}
            <div style={{ background: 'white', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border:'1px solid #f1f5f9' }}>
                <h3 style={{ marginTop: 0, fontSize: 16, color: '#334155', display:'flex', alignItems:'center', gap:8, marginBottom:25 }}>
                    💎 <span style={{fontWeight:'bold'}}>Plan & Diseño</span>
                </h3>
                <div style={{display:'flex', gap:15, marginBottom: 25}}>
                    <button onClick={() => updateProfile({ plan: 'simple' })} style={{ flex: 1, padding: 12, border: isSimple ? '2px solid #94a3b8' : '1px solid #e2e8f0', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#64748b', fontWeight:'bold', fontSize:13 }}>SIMPLE</button>
                    <button onClick={() => updateProfile({ plan: 'full' })} style={{ flex: 1, padding: 12, border: !isSimple ? '2px solid #eab308' : '1px solid #e2e8f0', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#ca8a04', fontWeight:'bold', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>FULL 👑</button>
                </div>
                {!isSimple ? (
                    <div style={{ fontSize: 13, color: '#166534', background:'#dcfce7', padding:15, borderRadius:8, textAlign:'center', border:'1px solid #bbf7d0' }}>✨ ¡Tienes libertad total de plantillas!</div>
                ) : (
                    <div style={{ background: '#fff7ed', padding: 20, borderRadius: 8, border: '1px solid #fed7aa' }}>
                        <label style={{ display:'block', fontSize: 12, color: '#9a3412', fontWeight:'bold', marginBottom:8 }}>CONFIRMAR PLANTILLA DEFINITIVA</label>
                        <select value={shopData.templateLocked || ''} onChange={(e) => handleLock(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #fdba74', color: '#9a3412', fontWeight: 'bold', cursor: 'pointer', background:'white' }}>
                            <option value="" disabled>-- Seleccionar --</option>
                            <option value="tienda">🛒 Tienda</option>
                            <option value="catalogo">📖 Catálogo</option>
                            <option value="menu">🍔 Menú</option>
                            <option value="personal">👤 Personal</option>
                        </select>
                        {shopData.templateLocked && <div style={{marginTop:8, fontSize:11, color:'#ea580c'}}>🔒 Bloqueado en: <b>{shopData.templateLocked.toUpperCase()}</b></div>}
                    </div>
                )}
            </div>

            {/* 3. SUSCRIPCIÓN (BOTÓN ACTUALIZADO) */}
            <div style={{ background: 'white', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border:'1px solid #f1f5f9' }}>
                <h3 style={{ marginTop: 0, fontSize: 16, color: '#334155', display:'flex', alignItems:'center', gap:8, marginBottom:25 }}>
                    💳 <span style={{fontWeight:'bold'}}>Suscripción</span>
                </h3>
                
                <div style={{ background: 'linear-gradient(135deg, #4b89dc 0%, #2e5b98 100%)', padding: 25, borderRadius: 12, color: 'white', marginBottom: 25, boxShadow: '0 8px 20px rgba(46, 91, 152, 0.25)', position:'relative', overflow:'hidden' }}>
                    <div style={{fontSize:18, fontWeight:'bold', marginBottom:25, display:'flex', alignItems:'center', gap:8}}>Mercado Pago <span style={{fontSize:10, background:'rgba(255,255,255,0.2)', padding:'3px 6px', borderRadius:4, fontWeight:'normal'}}>PRO</span></div>
                    <div style={{fontSize:16, opacity:0.9, letterSpacing:2, marginBottom:25, fontFamily:'monospace'}}>**** **** **** 1234</div>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                        <div><div style={{fontSize:9, opacity:0.8, marginBottom:2}}>TITULAR</div><div style={{fontSize:12, fontWeight:'bold', textTransform:'uppercase'}}>{shopData.nombreDueno || 'USUARIO'} {shopData.apellidoDueno}</div></div>
                        <div style={{textAlign:'right'}}><div style={{fontSize:9, opacity:0.8, marginBottom:2}}>EXP</div><div style={{fontSize:12, fontWeight:'bold'}}>12/28</div></div>
                    </div>
                </div>

                <div style={{textAlign:'center'}}>
                    <p style={{fontSize:12, color:'#64748b', marginBottom:15}}>
                        Suscríbete al Plan Full por <b>$5.000/mes</b>. Cancela cuando quieras.
                    </p>
                    
                    {/* BOTÓN REAL MERCADO PAGO */}
                    <button 
                        onClick={handleSubscribe} 
                        disabled={loadingPago}
                        style={{
                            width:'100%', padding:12, 
                            background: loadingPago ? '#94a3b8' : '#009ee3', 
                            color:'white', border:'none', borderRadius:8, 
                            cursor: loadingPago ? 'wait' : 'pointer', 
                            fontWeight:'bold', fontSize:13, transition:'background 0.2s'
                        }}
                    >
                        {loadingPago ? 'Procesando...' : 'Suscribirse Ahora 🚀'}
                    </button>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}