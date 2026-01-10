'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useShop } from '../context/ShopContext';
import Sidebar from '../components/Sidebar';
import { DOMAIN_URL } from '@/lib/constants';

function ConfiguracionContent() {
  const { shopData, updateProfile, changePassword, updateTemplateSlug, resetTemplate, activateTrial } = useShop();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPass, setNewPass] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [loadingPago, setLoadingPago] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false); // Estado para cancelar

  const [editingSlugs, setEditingSlugs] = useState<{[key:string]: string}>({});
  
  // Estado para la selección VISUAL de planes
  const [selectedPlan, setSelectedPlan] = useState<'simple' | 'full'>('full');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const PRECIO_SIMPLE = 15200;
  const PRECIO_FULL = 20100;

  // Lógica de fechas
  const trialStart = new Date(shopData.trial_start_date || shopData.created_at || new Date());
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - trialStart.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const daysLeft = Math.max(0, 14 - diffDays);
  const isExpired = daysLeft === 0;
  const isTrial = shopData.subscription_status === 'trial';
  const isActive = shopData.subscription_status === 'active';

  useEffect(() => { setEditingSlugs(shopData.slugs); }, [shopData.slugs]);
  
  // Sincronizar selección inicial con lo que tiene el usuario
  useEffect(() => {
      if (shopData.plan === 'simple') {
          setSelectedPlan('simple');
          if(shopData.templateLocked) setSelectedTemplate(shopData.templateLocked);
      } else {
          setSelectedPlan('full'); 
      }
  }, [shopData.plan, shopData.templateLocked]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkUser();
  }, [router]);

  // --- DETECCIÓN DE PAGO EXITOSO ---
  useEffect(() => {
    const status = searchParams.get('status');
    const collectionStatus = searchParams.get('collection_status');
    const preapprovalId = searchParams.get('preapproval_id'); // ID de suscripción de MP

    if ((status === 'success' || collectionStatus === 'approved') && shopData.id) {
        const activarCuenta = async () => {
            // Guardamos el estado active Y el ID de la suscripción para poder cancelarla luego
            const updates: any = { subscription_status: 'active' };
            if (preapprovalId) updates.mp_subscription_id = preapprovalId;

            const { error } = await supabase.from('shops').update(updates).eq('id', shopData.id);

            if (!error) {
                alert("🎉 ¡Suscripción confirmada y ACTIVA!");
                router.replace('/configuracion');
                setTimeout(() => window.location.reload(), 1000);
            }
        };
        if (shopData.subscription_status !== 'active') activarCuenta();
    }
  }, [searchParams, shopData.id, shopData.subscription_status, router]);

  // --- LÓGICA ACTIVAR PRUEBA GRATIS (O CAMBIAR PLAN EN TRIAL) ---
  const handlePlanActivation = async () => {
    setLoadingPlan(true);
    
    // Validaciones
    if (selectedPlan === 'simple' && !selectedTemplate) {
        alert("⚠️ Para el Plan Básico debes elegir una plantilla.");
        setLoadingPlan(false);
        return;
    }

    // Ejecutamos la lógica del contexto
    const success = await activateTrial(selectedPlan, selectedPlan === 'simple' ? selectedTemplate : undefined);
    setLoadingPlan(false);
    
    if (success) {
        alert(isTrial ? "✅ Plan actualizado correctamente." : "🎉 ¡Prueba activada! Disfruta tus 14 días.");
        router.refresh(); 
    } else {
        alert("Hubo un error al actualizar el plan.");
    }
  };

  // --- LÓGICA PAGAR (MERCADO PAGO) ---
  const handleSubscribe = async () => {
      setLoadingPago(true);
      try {
        // 1. Guardamos la preferencia de plan antes de ir a MP
        const updates: any = { plan: selectedPlan };
        if (selectedPlan === 'simple' && selectedTemplate) {
            updates.template_locked = selectedTemplate;
            updates.template = selectedTemplate;
        }
        await updateProfile(updates);

        // 2. Llamamos a la API
        const priceToPay = selectedPlan === 'full' ? PRECIO_FULL : PRECIO_SIMPLE;
        const response = await fetch('/api/crear-suscripcion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: shopData.email,
                plan: selectedPlan,
                shopId: shopData.id,
                price: priceToPay
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (data.url) window.location.href = data.url;
        else alert('Error: No se recibió link de pago.');

      } catch (error: any) {
          console.error(error);
          alert(`Error: ${error.message}`);
      } finally {
          setLoadingPago(false);
      }
  };

  // --- LÓGICA CANCELAR SUSCRIPCIÓN ---
  const handleCancelSubscription = async () => {
      if(!shopData.mp_subscription_id) return alert("No tienes una suscripción activa vinculada.");
      
      if(!confirm("⚠️ ¿Estás seguro de cancelar tu suscripción?\n\n- Se detendrá el cobro automático.\n- Al finalizar el período pagado, tu cuenta volverá a modo restringido.")) return;

      setLoadingCancel(true);
      try {
          // 1. Cancelar en Mercado Pago
          const res = await fetch('/api/cancelar-suscripcion', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ subscriptionId: shopData.mp_subscription_id })
          });
          
          if(!res.ok) throw new Error("Error al conectar con Mercado Pago");

          // 2. Actualizar base de datos local
          await supabase.from('shops').update({ 
              subscription_status: 'cancelled',
              plan: 'none', // Opcional: bajar a none o dejarlo hasta que expire
              mp_subscription_id: null
          }).eq('id', shopData.id);

          alert("✅ Suscripción cancelada. No se realizarán más cobros.");
          window.location.reload();

      } catch (error:any) {
          alert("Error: " + error.message);
      } finally {
          setLoadingCancel(false);
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

  const handleDeactivate = async (tmpl: string) => { if(confirm(`⚠️ ¿ELIMINAR ${tmpl.toUpperCase()}?`)) await resetTemplate(tmpl); };
  const handleCopy = (slug: string) => { navigator.clipboard.writeText(`${DOMAIN_URL}/${slug}`); alert("¡Link copiado!"); };
  const handleSaveName = async () => { await updateProfile({ nombreDueno: shopData.nombreDueno, apellidoDueno: shopData.apellidoDueno }); alert("✅ Datos guardados."); };

  // Filtro de links activos
  const templatesList = [
      { id: 'tienda', label: 'Tienda Online', icon: '🛍️', color: '#3b82f6' },
      { id: 'catalogo', label: 'Catálogo Digital', icon: '📒', color: '#8b5cf6' },
      { id: 'menu', label: 'Menú Gastronómico', icon: '🍽️', color: '#f59e0b' },
      { id: 'personal', label: 'Bio Personal', icon: '🪪', color: '#ec4899' }
  ];
  const activeTemplates = templatesList.filter(t => {
      if (shopData.plan === 'simple') return shopData.templateLocked === t.id && shopData.slugs[t.id];
      return shopData.slugs[t.id];
  });

  return (
      <main className="main-content" style={{ padding: '40px', overflowY: 'auto', background: '#f8fafc', width: '100%', minHeight: '100vh', justifyContent: 'start', flex: 1 }}>
        
        {/* HEADER */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:10}}>
            <span style={{fontSize:28, color:'#94a3b8'}}>⚙️</span>
            <h1 style={{ margin: 0, color: '#1e293b', fontSize: 28, fontWeight: '800' }}>Configuración</h1>
        </div>

        {/* --- STATUS BAR --- */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom: 30 }}>
            <div style={{ 
                background: isActive ? '#dcfce7' : (isExpired ? '#fef2f2' : 'white'), 
                padding: '10px 25px', borderRadius: 50, 
                border: isActive ? '1px solid #22c55e' : (isExpired ? '1px solid #fca5a5' : '1px solid #e2e8f0'), 
                display:'flex', alignItems:'center', gap:10, boxShadow:'0 4px 15px rgba(0,0,0,0.05)' 
            }}>
                <span style={{fontSize:20}}>{isActive ? '⭐' : '⏳'}</span>
                <div style={{textAlign:'left'}}>
                    <div style={{fontSize:11, color:'#64748b', fontWeight:'bold', textTransform:'uppercase', letterSpacing:1}}>
                        {isActive ? 'Suscripción Activa' : 'Periodo de Prueba'}
                    </div>
                    <div style={{fontSize:15, fontWeight:'bold', color: isActive ? '#15803d' : (isExpired ? '#dc2626' : '#334155')}}>
                        {isActive ? '¡Todo en orden!' : (isExpired ? '¡Tiempo Agotado!' : `${daysLeft} días restantes`)}
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
                                    <div style={{display:'flex', alignItems:'center', gap:8}}><span style={{fontSize:22}}>{t.icon}</span><span style={{fontWeight:'bold', fontSize:14, color:'#334155'}}>{t.label}</span></div>
                                    <button onClick={() => handleDeactivate(t.id)} title="Desactivar" style={{background:'transparent', border:'none', cursor:'pointer', fontSize:16, opacity:0.5}}>🗑️</button>
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

            {/* 2. CARD DE PLANES (LÓGICA ACTUALIZADA) */}
            <div style={{ background: 'white', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: shopData.plan === 'none' ? '2px solid #f1c40f' : '1px solid #f1f5f9', display:'flex', flexDirection:'column' }}>
                <h3 style={{ marginTop: 0, fontSize: 16, color: '#334155', display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                    💳 <span style={{fontWeight:'bold'}}>Planes</span>
                    {shopData.plan === 'none' && <span style={{fontSize:10, background:'#f1c40f', color:'white', padding:'2px 8px', borderRadius:10}}>Requerido</span>}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
                    {/* BÁSICO */}
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
                        
                        {/* SELECTOR DE PLANTILLA (SOLO APARECE EN PLAN SIMPLE) */}
                        {selectedPlan === 'simple' && (
                              <div style={{marginTop:10, borderTop:'1px dashed #bfdbfe', paddingTop:10}}>
                                  <label style={{fontSize:10, fontWeight:'bold', display:'block', color:'#1e40af'}}>Elige tu plantilla:</label>
                                  <select 
                                    value={selectedTemplate} 
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    // Si ya tiene plan activo bloqueado, deshabilitamos
                                    disabled={shopData.plan === 'simple' && isActive}
                                    style={{width:'100%', padding:5, marginTop:5, fontSize:11, borderRadius:4, border:'1px solid #bfdbfe', opacity: (shopData.plan === 'simple' && isActive) ? 0.6 : 1}}
                                  >
                                      <option value="" disabled>-- Seleccionar --</option>
                                      <option value="tienda">Tienda</option>
                                      <option value="catalogo">Catálogo</option>
                                      <option value="menu">Menú</option>
                                      <option value="personal">Personal</option>
                                  </select>
                              </div>
                          )}
                    </div>

                    {/* FULL */}
                    <div 
                        onClick={() => { setSelectedPlan('full'); setSelectedTemplate(''); }}
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

                <div style={{marginTop:'auto', paddingTop:15, borderTop:'1px dashed #e2e8f0'}}>
                    <p style={{margin:'0 0 10px 0', fontSize:11, color:'#64748b', textAlign:'center'}}>
                        {isActive ? 'Tu próximo cobro será automático.' : 'Los primeros 14 días son GRATIS.'}
                    </p>

                    {/* BOTÓN 1: ACTIVAR PRUEBA (O CAMBIAR PLAN SI AÚN ESTÁ EN PRUEBA) */}
                    {(!isActive && !isExpired) && (
                        <button 
                            onClick={handlePlanActivation}
                            disabled={loadingPlan || (selectedPlan === 'simple' && !selectedTemplate)}
                            style={{
                                width: '100%', padding: 12, borderRadius: 8, border: 'none', marginBottom: 10,
                                background: (loadingPlan || (selectedPlan === 'simple' && !selectedTemplate)) ? '#ccc' : '#2ecc71',
                                color: 'white', fontWeight: 'bold', fontSize: 14,
                                cursor: 'pointer', boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)'
                            }}
                        >
                            {loadingPlan ? 'Procesando...' : (shopData.plan !== 'none' ? '🔄 Actualizar Plan (Sin cargo)' : '✅ Activar Prueba Gratis (14 Días)')}
                        </button>
                    )}

                    {/* BOTÓN 2: PAGAR (SIEMPRE DISPONIBLE O SI EXPIRÓ) */}
                    <button 
                        onClick={handleSubscribe} 
                        disabled={loadingPago}
                        style={{
                            width: '100%', padding: 12, borderRadius: 8, border: 'none',
                            background: '#5a99fa', color: 'white', fontWeight: 'bold', fontSize: 14,
                            cursor: loadingPago ? 'not-allowed' : 'pointer',
                            opacity: loadingPago ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                            boxShadow: '0 4px 10px rgba(90, 153, 250, 0.3)'
                        }}
                    >
                        {loadingPago ? 'Cargando...' : (isActive ? '💳 Actualizar Método de Pago' : '💳 Suscripción (Mercado Pago)')}
                    </button>
                </div>
            </div>
            
            {/* 3. MI PERFIL */}
            <div style={{ background: 'white', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border:'1px solid #f1f5f9' }}>
                <h3 style={{ marginTop: 0, fontSize: 16, color: '#334155', display:'flex', alignItems:'center', gap:8, marginBottom:25 }}>
                    👤 <span style={{fontWeight:'bold'}}>Mi Perfil</span>
                </h3>
                <div style={{display:'flex', gap:10, marginBottom:15}}>
                    <div style={{flex:1}}><label style={{display:'block', fontSize:11, fontWeight:'bold', color:'#64748b', marginBottom:5}}>Nombre</label><input type="text" value={shopData.nombreDueno} onChange={(e) => updateProfile({nombreDueno: e.target.value})} style={{width:'100%', padding:10, border:'1px solid #cbd5e1', borderRadius:6, fontSize:13}} /></div>
                    <div style={{flex:1}}><label style={{display:'block', fontSize:11, fontWeight:'bold', color:'#64748b', marginBottom:5}}>Apellido</label><input type="text" value={shopData.apellidoDueno} onChange={(e) => updateProfile({apellidoDueno: e.target.value})} style={{width:'100%', padding:10, border:'1px solid #cbd5e1', borderRadius:6, fontSize:13}} /></div>
                </div>
                <button onClick={handleSaveName} style={{marginBottom:20, background:'#3b82f6', color:'white', border:'none', borderRadius:4, padding:'8px 15px', fontSize:12, cursor:'pointer'}}>Guardar Nombre</button>
                <div style={{marginBottom:20}}><label style={{display:'block', fontSize:11, fontWeight:'bold', color:'#64748b', marginBottom:5}}>Email</label><input type="text" value={shopData.email} disabled style={{width:'100%', padding:10, border:'none', borderRadius:6, background:'#f1f5f9', color:'#94a3b8', fontSize:13}} /></div>
                <hr style={{border:'none', borderTop:'1px solid #f1f5f9', margin:'20px 0'}} />
                <label style={{display:'block', fontSize:11, fontWeight:'bold', color:'#64748b', marginBottom:5}}>Contraseña</label>
                <div style={{ display: 'flex', gap: 10 }}>
                     <input type="password" placeholder="Nueva..." value={newPass} onChange={e => setNewPass(e.target.value)} style={{ flex:1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize:13 }} />
                     <button onClick={handlePassChange} disabled={loadingPass} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, padding:'0 15px', cursor: 'pointer' }}>OK</button>
                </div>
            </div>

            {/* 4. NUEVA CARD: GESTIONAR SUSCRIPCIÓN (BAJA) */}
            {isActive && (
                <div style={{ background: 'white', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border:'1px solid #f1f5f9' }}>
                    <h3 style={{ marginTop: 0, fontSize: 16, color: '#334155', display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                        ⛔ <span style={{fontWeight:'bold'}}>Zona de Peligro</span>
                    </h3>
                    <p style={{fontSize:13, color:'#64748b', marginBottom:15}}>
                        Si cancelas, perderás el acceso a las funciones de edición al finalizar tu período actual.
                    </p>
                    <button 
                        onClick={handleCancelSubscription} 
                        disabled={loadingCancel}
                        style={{
                            width: '100%', padding: 12, borderRadius: 8, border: '1px solid #fca5a5',
                            background: '#fef2f2', color: '#dc2626', fontWeight: 'bold', fontSize: 13,
                            cursor: loadingCancel ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loadingCancel ? 'Cancelando...' : 'Cancelar Suscripción'}
                    </button>
                </div>
            )}

        </div>
      </main>
  );
}

export default function ConfiguracionPage() {
  return (
    <div className="contenedor-layout" style={{display:'flex'}}>
      <Sidebar activeTab="configuracion" />
      <Suspense fallback={<div style={{padding:20}}>Cargando configuración...</div>}>
         <ConfiguracionContent />
      </Suspense>
    </div>
  );
}