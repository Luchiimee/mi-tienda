'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '../context/ShopContext'; 
import Sidebar from '../components/Sidebar';
import { supabase } from '@/lib/supabaseClient';

export default function ConfiguracionPage() {
  const { shopData, updateProfile, changePassword, activateTrial } = useShop();
  const router = useRouter();

  // Estados locales para el formulario de perfil
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  
  // Estados para cambio de contraseña
  const [pass, setPass] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);

  // Estados para SELECCIÓN DE PLAN
  const [selectedPlan, setSelectedPlan] = useState<'simple' | 'full' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    if (shopData.nombreDueno) setNombre(shopData.nombreDueno);
    if (shopData.apellidoDueno) setApellido(shopData.apellidoDueno);
  }, [shopData]);

  // Protección de sesión
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkUser();
  }, [router]);

  const handleProfileSave = async () => {
    await updateProfile({ nombreDueno: nombre, apellidoDueno: apellido });
    alert("✅ Perfil actualizado");
  };

  const handlePassSave = async () => {
    setLoadingPass(true);
    const error = await changePassword(pass);
    setLoadingPass(false);
    if (error) alert("Error: " + error.message);
    else {
      alert("✅ Contraseña cambiada exitosamente");
      setPass('');
    }
  };

  const handlePlanActivation = async () => {
    setLoadingPlan(true);
    let success = false;

    if (selectedPlan === 'full') {
        success = await activateTrial('full');
    } else if (selectedPlan === 'simple' && selectedTemplate) {
        success = await activateTrial('simple', selectedTemplate);
    }

    setLoadingPlan(false);
    
    if (success) {
        alert("🎉 ¡Plan activado! Ya puedes editar tu tienda.");
        // Opcional: Redirigir al admin o quedarse aquí
        router.push('/admin'); 
    } else {
        alert("Error al activar el plan. Intenta nuevamente.");
    }
  };

  return (
    <div className="contenedor-layout">
      <Sidebar activeTab="configuracion" />

      <main className="main-content" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '30px' }}>⚙️ Configuración</h1>

        {/* --- TARJETA 1: PLAN Y SUSCRIPCIÓN (LA NUEVA) --- */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px', border: shopData.plan === 'none' ? '2px solid #f1c40f' : '1px solid #eee' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', display:'flex', alignItems:'center', gap:10 }}>
              🚀 Tu Plan 
              {shopData.plan === 'none' && <span style={{fontSize:12, background:'#f1c40f', color:'white', padding:'2px 8px', borderRadius:10}}>Requerido</span>}
          </h2>

          {shopData.plan === 'none' ? (
              // --- SELECTOR DE PLANES (Si es usuario nuevo) ---
              <div>
                  <p style={{color:'#666', marginBottom:20}}>Selecciona un plan para comenzar tu prueba de 14 días y desbloquear la edición.</p>
                  
                  <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
                      {/* OPCIÓN BÁSICA */}
                      <div 
                        onClick={() => setSelectedPlan('simple')}
                        style={{flex:1, minWidth:250, border: selectedPlan === 'simple' ? '2px solid #3b82f6' : '1px solid #ddd', padding:15, borderRadius:8, cursor:'pointer', opacity: (selectedPlan && selectedPlan !== 'simple') ? 0.5 : 1}}
                      >
                          <h3 style={{margin:0}}>Básico</h3>
                          <p style={{fontSize:12, color:'#666'}}>1 Plantilla fija.</p>
                          
                          {selectedPlan === 'simple' && (
                              <div style={{marginTop:10}}>
                                  <label style={{fontSize:11, fontWeight:'bold', display:'block'}}>Elige tu plantilla:</label>
                                  <select 
                                    value={selectedTemplate} 
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    style={{width:'100%', padding:5, marginTop:5}}
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

                      {/* OPCIÓN FULL */}
                      <div 
                        onClick={() => { setSelectedPlan('full'); setSelectedTemplate(''); }}
                        style={{flex:1, minWidth:250, border: selectedPlan === 'full' ? '2px solid #3b82f6' : '1px solid #ddd', padding:15, borderRadius:8, cursor:'pointer', opacity: (selectedPlan && selectedPlan !== 'full') ? 0.5 : 1}}
                      >
                          <h3 style={{margin:0}}>Full</h3>
                          <p style={{fontSize:12, color:'#666'}}>Todas las plantillas desbloqueadas.</p>
                      </div>
                  </div>

                  <button 
                    onClick={handlePlanActivation}
                    disabled={!selectedPlan || (selectedPlan === 'simple' && !selectedTemplate) || loadingPlan}
                    style={{
                        marginTop: 20, width: '100%', padding: 12, 
                        background: (!selectedPlan || (selectedPlan === 'simple' && !selectedTemplate)) ? '#ccc' : '#2ecc71',
                        color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    {loadingPlan ? 'Activando...' : '✅ Activar Prueba Gratis (14 Días)'}
                  </button>
              </div>
          ) : (
              // --- INFO DEL PLAN ACTUAL (Si ya tiene plan) ---
              <div style={{background:'#f8f9fa', padding:15, borderRadius:8}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                      <span>Plan Actual:</span>
                      <strong style={{textTransform:'uppercase', color:'#3b82f6'}}>{shopData.plan}</strong>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                      <span>Estado:</span>
                      <strong style={{color: shopData.subscription_status === 'trial' ? '#f39c12' : '#27ae60'}}>
                          {shopData.subscription_status === 'trial' ? 'Prueba Gratuita' : 'Activo'}
                      </strong>
                  </div>
                  {shopData.plan === 'simple' && shopData.templateLocked && (
                      <div style={{fontSize:12, color:'#666'}}>
                          Plantilla bloqueada: <b>{shopData.templateLocked}</b>
                      </div>
                  )}
              </div>
          )}
        </div>

        {/* --- TARJETA 2: MI PERFIL --- */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>👤 Mi Perfil</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666' }}>Nombre</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666' }}>Apellido</label>
              <input type="text" value={apellido} onChange={e => setApellido(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
          </div>
          <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666' }}>Email (No editable)</label>
              <input type="text" value={shopData.email} disabled style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #eee', background: '#f9f9f9', color: '#999' }} />
          </div>
          <button onClick={handleProfileSave} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Guardar Cambios</button>
        </div>

        {/* --- TARJETA 3: SEGURIDAD --- */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>🔒 Seguridad</h2>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666' }}>Cambiar Contraseña</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="password" placeholder="Nueva contraseña" value={pass} onChange={e => setPass(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            <button disabled={loadingPass || !pass} onClick={handlePassSave} style={{ padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: !pass ? 0.5 : 1 }}>
                {loadingPass ? '...' : 'Actualizar'}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}