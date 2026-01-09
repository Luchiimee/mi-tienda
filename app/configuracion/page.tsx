'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useShop } from '../context/ShopContext';
import Sidebar from '../components/Sidebar';
import { DOMAIN_URL } from '@/lib/constants';

export default function ConfiguracionPage() {
  const { shopData, updateProfile, changePassword, updateTemplateSlug, resetTemplate, lockTemplate } = useShop();
  const router = useRouter();

  const [newPass, setNewPass] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [loadingPago, setLoadingPago] = useState(false);
  const [editingSlugs, setEditingSlugs] = useState<{[key:string]: string}>({});
  
  // Estado para SELECCIONAR qué plan quiere pagar (por defecto el Full o el que tenga)
  const [selectedPlan, setSelectedPlan] = useState<'simple' | 'full'>('full');

  // --- PRECIOS ACTUALIZADOS ---
  const PRECIO_SIMPLE = 15200;
  const PRECIO_FULL = 20100;

  // --- LÓGICA DE DÍAS RESTANTES ---
  const trialStart = new Date(shopData.trial_start_date || shopData.created_at || new Date());
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - trialStart.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const daysLeft = Math.max(0, 14 - diffDays);
  const isExpired = daysLeft === 0;

  useEffect(() => { setEditingSlugs(shopData.slugs); }, [shopData.slugs]);
  
  // Sincronizar selección inicial con el plan actual del usuario
  useEffect(() => {
      if (shopData.plan === 'simple') setSelectedPlan('simple');
      else setSelectedPlan('full');
  }, [shopData.plan]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkUser();
  }, [router]);

  const handleSubscribe = async () => {
      setLoadingPago(true);
      try {
        const priceToPay = selectedPlan === 'full' ? PRECIO_FULL : PRECIO_SIMPLE;

        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: shopData.email,
                plan: selectedPlan, // Usamos el plan seleccionado en la UI
                shopId: shopData.id,
                price: priceToPay
            }),
        });

        const data = await response.json();
        
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert('Error al generar el pago. Intenta nuevamente.');
        }
      } catch (error) {
          console.error(error);
          alert('Error de conexión.');
      } finally {
          setLoadingPago(false);
      }
  };

  const handlePassChange = async () => {
    if (newPass.length < 6) return alert("Mínimo 6 caracteres."); setLoadingPass(true);
    const err = await changePassword(newPass); setLoadingPass(false);
    if (err) alert("Error: " + err.message); else { alert("¡Contraseña actualizada!"); setNewPass(''); }
  };

  const handleSaveSpecificSlug = async (tmpl: string) => {
      const newVal = editingSlugs[tmpl];
      if(!newVal) return alert("El link no puede estar vacío");
      await updateTemplateSlug(tmpl, newVal);
      alert(`✅ Link actualizado.`);
  };

  const handleDeactivate = async (tmpl: string) => {
      if(confirm(`⚠️ ¿ELIMINAR ${tmpl.toUpperCase()}?`)) await resetTemplate(tmpl);
  };

  const handleCopy = (slug: string) => {
      navigator.clipboard.writeText(`${DOMAIN_URL}/${slug}`);
      alert("¡Link copiado!");
  };

  const handleSaveName = async () => {
      await updateProfile({ nombreDueno: shopData.nombreDueno, apellidoDueno: shopData.apellidoDueno });
      alert("✅ Datos guardados.");
  };

  const templatesList = [
      { id: 'tienda', label: 'Tienda Online', icon: '🛍️', color: '#3b82f6' },
      { id: 'catalogo', label: 'Catálogo Digital', icon: '📒', color: '#8b5cf6' },
      { id: 'menu', label: 'Menú Gastronómico', icon: '🍽️', color: '#f59e0b' },
      { id: 'personal', label: 'Bio Personal', icon: '🪪', color: '#ec4899' }
  ];

  const activeTemplates = templatesList.filter(t => {
      if (shopData.plan === 'simple') {
          return shopData.templateLocked === t.id && shopData.slugs[t.id];
      }
      return shopData.slugs[t.id];
  });

  return (
    <div className="contenedor-layout" style={{display:'flex'}}>
      <Sidebar activeTab="configuracion" />

      <main className="main-content" style={{ padding: '40px', overflowY: 'auto', background: '#f8fafc', width: '100%', minHeight: '100vh', justifyContent: 'start', flex: 1 }}>
        
        {/* HEADER */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:10}}>
            <span style={{fontSize:28, color:'#94a3b8'}}>⚙️</span>
            <h1 style={{ margin: 0, color: '#1e293b', fontSize: 28, fontWeight: '800' }}>Configuración</h1>
        </div>

        {/* --- CONTADOR DE DÍAS (CENTRADO) --- */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom: 30 }}>
            <div style={{ 
                background: isExpired ? '#fef2f2' : 'white', 
                padding: '10px 25px', 
                borderRadius: 50, 
                border: isExpired ? '1px solid #fca5a5' : '1px solid #e2e8f0', 
                display:'flex', alignItems:'center', gap:10, 
                boxShadow:'0 4px 15px rgba(0,0,0,0.05)' 
            }}>
                <span style={{fontSize:20}}>⏳</span>
                <div style={{textAlign:'left'}}>
                    <div style={{fontSize:11, color:'#64748b', fontWeight:'bold', textTransform:'uppercase', letterSpacing:1}}>Prueba Gratis</div>
                    <div style={{fontSize:15, fontWeight:'bold', color: isExpired ? '#dc2626' : '#334155'}}>
                        {isExpired ? '¡Expirado!' : `${daysLeft} días restantes`}
                    </div>
                </div>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', width: '100%' }}>
            
            {/* 1. ACCESOS RÁPIDOS */}
            <div style={{ background: 'white', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border:'1px solid #f1f5f9', gridColumn: '1 / -1' }}>
                <h3 style={{ marginTop: 0, fontSize: 16, color: '#334155', display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                    🚀 <span style={{fontWeight:'bold'}}>Mis Links Activos</span>
                </h3>
                
                {activeTemplates.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 15 }}>
                        {activeTemplates.map((t) => (
                            <div key={t.id} style={{ background: 'white', padding: 15, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden' }}>
                                <div style={{position:'absolute', left:0, top:0, bottom:0, width:4, background: t.color}}></div>
                                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', paddingLeft: 10}}>
                                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                                        <span style={{fontSize:22}}>{t.icon}</span>
                                        <span style={{fontWeight:'bold', fontSize:14, color:'#334155'}}>{t.label}</span>
                                    </div>
                                    <button onClick={() => handleDeactivate(t.id)} title="Eliminar" style={{background:'transparent', border:'none', cursor:'pointer', fontSize:16, opacity:0.5}}>🗑️</button>
                                </div>
                                <div style={{display:'flex', alignItems:'center', background:'#f8fafc', border:'1px solid #cbd5e1', borderRadius:8, padding:'5px 10px', marginLeft: 10}}>
                                    <span style={{fontSize:11, color:'#94a3b8', marginRight:2}}>{DOMAIN_URL.replace('https://','')}/</span>
                                    <input type="text" value={editingSlugs[t.id] || ''} onChange={(e) => setEditingSlugs({...editingSlugs, [t.id]: e.target.value})} style={{border: 'none', background: 'transparent', fontWeight: '600', color: '#334155', outline: 'none', width: '100%', fontSize: 13}} />
                                    <span style={{fontSize:12}}>✏️</span>
                                </div>
                                <div style={{display:'flex', gap:8, paddingLeft: 10, marginTop: 5}}>
                                    <button onClick={() => handleSaveSpecificSlug(t.id)} style={{flex:1, background: t.color, color:'white', border:'none', borderRadius:6, padding:'6px', fontSize:12, fontWeight:'bold', cursor:'pointer'}}>Guardar</button>
                                    <button onClick={() => handleCopy(editingSlugs[t.id])} style={{flex:1, background:'white', border:`1px solid ${t.color}`, color: t.color, borderRadius:6, padding:'6px', fontSize:12, fontWeight:'bold', cursor:'pointer'}}>Copiar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{textAlign:'center', padding:30, color:'#94a3b8', border:'2px dashed #e2e8f0', borderRadius:12, background:'#f9fafb'}}>
                        <div style={{fontSize:30, marginBottom:10}}>🕸️</div>
                        <p style={{margin:0, fontSize:14}}>No tienes links activos.</p>
                        {shopData.plan === 'simple' && !shopData.templateLocked && <p style={{fontSize:12, color:'#d97706'}}>👆 Primero elige tu plantilla en el Plan Básico.</p>}
                    </div>
                )}
            </div>

            {/* 2. CARD DE PLANES (REDISEÑADA PARA PAGO) */}
            <div style={{ background: 'white', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column' }}>
                <h3 style={{ marginTop: 0, fontSize: 16, color: '#334155', display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                    💳 <span style={{fontWeight:'bold'}}>Planes</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
                    
                    {/* OPCIÓN PLAN BÁSICO */}
                    <div 
                        onClick={() => setSelectedPlan('simple')}
                        style={{ 
                            border: selectedPlan === 'simple' ? '2px solid #3b82f6' : '1px solid #e2e8f0', 
                            borderRadius: 12, padding: 15, position: 'relative', 
                            background: selectedPlan === 'simple' ? '#eff6ff' : 'white', 
                            cursor:'pointer', transition:'all 0.2s'
                        }} 
                    >
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#334155' }}>Plan Básico</div>
                            {selectedPlan === 'simple' && <div style={{fontSize:14, color:'#3b82f6'}}>●</div>}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: '800', color: '#3b82f6', margin: '5px 0' }}>$15.200<span style={{fontSize:11, fontWeight:'normal', color:'#64748b'}}>/mes</span></div>
                        <div style={{ fontSize: 10, background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginBottom: 10 }}>14 Días Gratis</div>
                        <ul style={{ padding: 0, listStyle: 'none', fontSize: 11, color: '#64748b' }}>
                            <li>✅ 1 Plantilla Activa</li>
                            <li>🔒 Otras bloqueadas</li>
                        </ul>
                    </div>

                    {/* OPCIÓN PLAN FULL */}
                    <div 
                        onClick={() => setSelectedPlan('full')}
                        style={{ 
                            border: selectedPlan === 'full' ? '2px solid #eab308' : '1px solid #e2e8f0', 
                            borderRadius: 12, padding: 15, position: 'relative', 
                            background: selectedPlan === 'full' ? '#fffbeb' : 'white', 
                            cursor:'pointer', transition:'all 0.2s'
                        }} 
                    >
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#334155' }}>Plan Full 👑</div>
                            {selectedPlan === 'full' && <div style={{fontSize:14, color:'#eab308'}}>●</div>}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: '800', color: '#d97706', margin: '5px 0' }}>$20.100<span style={{fontSize:11, fontWeight:'normal', color:'#64748b'}}>/mes</span></div>
                        <div style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginBottom: 10 }}>14 Días Gratis</div>
                        <ul style={{ padding: 0, listStyle: 'none', fontSize: 11, color: '#64748b' }}>
                            <li>✅ Todo Ilimitado</li>
                            <li>🚀 Múltiples Links</li>
                        </ul>
                    </div>
                </div>

                {/* INFO DE COBRO Y BOTÓN DE PAGO FUERA DE LAS CARDS */}
                <div style={{marginTop:'auto', paddingTop:15, borderTop:'1px dashed #e2e8f0'}}>
                    <p style={{margin:'0 0 10px 0', fontSize:11, color:'#64748b', textAlign:'center'}}>
                        📅 Se cobrará automáticamente cada 30 días.<br/>
                        Los primeros 14 días son <b>GRATIS</b>.
                    </p>
                    <button 
                        onClick={handleSubscribe} 
                        disabled={loadingPago}
                        style={{
                            width: '100%', padding: 12, borderRadius: 8, border: 'none',
                            background: '#009ee3', color: 'white', fontWeight: 'bold', fontSize: 14,
                            cursor: loadingPago ? 'not-allowed' : 'pointer',
                            opacity: loadingPago ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8
                        }}
                    >
                        {loadingPago ? 'Generando link...' : `Suscripción ${selectedPlan.toUpperCase()} (Mercado Pago)`}
                    </button>
                </div>

                {/* SELECTOR DE PLANTILLA (SOLO SI ES SIMPLE Y NO ELIGIÓ AÚN) */}
                {shopData.plan === 'simple' && (
                    <div style={{ marginTop: 20, padding: 15, background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa' }}>
                        <label style={{ display:'block', fontSize: 12, color: '#9a3412', fontWeight:'bold', marginBottom:8 }}>ELIGE TU PLANTILLA ÚNICA:</label>
                        <select 
                            value={shopData.templateLocked || ''} 
                            onChange={(e) => { if(confirm("¿Confirmar esta plantilla?")) lockTemplate(e.target.value); }} 
                            disabled={!!shopData.templateLocked}
                            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #fdba74', color: '#9a3412', fontWeight: 'bold', cursor: !!shopData.templateLocked ? 'not-allowed' : 'pointer', background:'white', opacity: !!shopData.templateLocked ? 0.7 : 1 }}
                        >
                            <option value="" disabled>-- Seleccionar --</option>
                            <option value="tienda">🛒 Tienda Online</option>
                            <option value="catalogo">📒 Catálogo</option>
                            <option value="menu">🍽️ Menú</option>
                            <option value="personal">🪪 Personal</option>
                        </select>
                        {shopData.templateLocked && <div style={{marginTop:5, fontSize:11, color:'#ea580c'}}>🔒 Bloqueado en: <b>{shopData.templateLocked.toUpperCase()}</b></div>}
                    </div>
                )}
            </div>
            
            {/* 3. MI PERFIL */}
            <div style={{ background: 'white', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border:'1px solid #f1f5f9' }}>
                <h3 style={{ marginTop: 0, fontSize: 16, color: '#334155', display:'flex', alignItems:'center', gap:8, marginBottom:25 }}>
                    👤 <span style={{fontWeight:'bold'}}>Mi Perfil</span>
                </h3>
                
                <div style={{display:'flex', gap:10, marginBottom:15}}>
                    <div style={{flex:1}}>
                        <label style={{display:'block', fontSize:11, fontWeight:'bold', color:'#64748b', marginBottom:5}}>Nombre</label>
                        <input type="text" value={shopData.nombreDueno} onChange={(e) => updateProfile({nombreDueno: e.target.value})} style={{width:'100%', padding:10, border:'1px solid #cbd5e1', borderRadius:6, fontSize:13}} />
                    </div>
                    <div style={{flex:1}}>
                        <label style={{display:'block', fontSize:11, fontWeight:'bold', color:'#64748b', marginBottom:5}}>Apellido</label>
                        <input type="text" value={shopData.apellidoDueno} onChange={(e) => updateProfile({apellidoDueno: e.target.value})} style={{width:'100%', padding:10, border:'1px solid #cbd5e1', borderRadius:6, fontSize:13}} />
                    </div>
                </div>
                <button onClick={handleSaveName} style={{marginBottom:20, background:'#3b82f6', color:'white', border:'none', borderRadius:4, padding:'8px 15px', fontSize:12, cursor:'pointer'}}>Guardar Nombre</button>

                <div style={{marginBottom:20}}>
                    <label style={{display:'block', fontSize:11, fontWeight:'bold', color:'#64748b', marginBottom:5}}>Email</label>
                    <input type="text" value={shopData.email} disabled style={{width:'100%', padding:10, border:'none', borderRadius:6, background:'#f1f5f9', color:'#94a3b8', fontSize:13}} />
                </div>

                <hr style={{border:'none', borderTop:'1px solid #f1f5f9', margin:'20px 0'}} />

                <label style={{display:'block', fontSize:11, fontWeight:'bold', color:'#64748b', marginBottom:5}}>Contraseña</label>
                <div style={{ display: 'flex', gap: 10 }}>
                     <input type="password" placeholder="Nueva..." value={newPass} onChange={e => setNewPass(e.target.value)} style={{ flex:1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize:13 }} />
                     <button onClick={handlePassChange} disabled={loadingPass} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, padding:'0 15px', cursor: 'pointer' }}>OK</button>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}