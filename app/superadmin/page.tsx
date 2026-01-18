'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Asegurate que este email sea EXACTAMENTE el que usas en Supabase (minúsculas)
const ADMIN_EMAIL = 'luchiimee2@gmail.com'.toLowerCase(); 

export default function SuperAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [stats, setStats] = useState({ total: 0, simple: 0, full: 0, trial: 0, active: 0, income: 0 });
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);

  useEffect(() => {
    const init = async () => {
      // 1. Verificar Usuario (Seguridad Frontend)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
        alert("⛔ Acceso Restringido: No eres Super Admin.");
        router.push('/admin'); 
        return;
      }

      try {
          // 2. Cargar Tiendas (Aquí está el bloque que preguntabas)
          const { data: shops, error: shopsError } = await supabase
            .from('shops')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (shopsError) throw shopsError;

          // --- AQUÍ VA EL BLOQUE IF (SHOPS) ---
          if (shops) {
            setUsers(shops);
            
            // Calcular Métricas
            let simple = 0, full = 0, trial = 0, active = 0, income = 0;
            shops.forEach(s => {
              if (s.plan === 'simple') simple++;
              if (s.plan === 'full') full++;
              if (s.subscription_status === 'trial') trial++;
              if (s.subscription_status === 'active') {
                  active++;
                  // Sumar ingresos estimados según plan
                  if (s.plan === 'simple') income += 15200;
                  if (s.plan === 'full') income += 20100;
              }
            });
            setStats({ total: shops.length, simple, full, trial, active, income });
          } else {
             console.log("No se encontraron tiendas o permisos denegados");
          }
          // ------------------------------------

          // 3. Cargar Cupones
          const { data: cup, error: cupError } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (cupError) console.warn("Error cargando cupones:", cupError);
          if (cup) setCoupons(cup);

      } catch (err: any) {
          console.error("Error Super Admin:", err);
          setErrorMsg("Error cargando datos: Posiblemente faltan permisos RLS en Supabase.");
      } finally {
          // ESTO ES CLAVE: Pase lo que pase (éxito o error), sacamos el "Cargando..."
          setLoading(false);
      }
    };
    
    init();
  }, [router]);

  const handleCreateCoupon = async () => {
    if (!newCode) return;
    const { error } = await supabase.from('coupons').insert([{ code: newCode.toUpperCase(), discount_percent: newDiscount, active: true }]);
    
    if (error) {
        alert("Error creando cupón: " + error.message);
    } else {
        setNewCode('');
        alert("✅ Cupón creado correctamente (recarga la página para verlo en la lista)");
        // Opcional: Podrías llamar a init() aquí de nuevo para recargar sin F5
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if(confirm("¿Estás seguro de borrar este cupón?")) { 
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) {
            alert("Error al borrar: " + error.message);
        } else {
            setCoupons(prev => prev.filter(c => c.id !== id));
        }
    }
  };

  // --- RENDERIZADO VISUAL ---

  if (loading) return (
    <div style={{background:'#0f172a', height:'100vh', color:'white', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <div style={{fontSize: '40px', marginBottom: '20px'}}>⚡</div>
        <div>Cargando Centro de Comando...</div>
    </div>
  );

  if (errorMsg) return (
      <div style={{background:'#0f172a', height:'100vh', color:'#f87171', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20}}>
          <div style={{fontSize:20}}>⚠️ {errorMsg}</div>
          <p style={{color: '#cbd5e1'}}>Verifica tus políticas RLS en Supabase.</p>
          <button onClick={() => router.push('/admin')} style={{padding:'10px 20px', cursor:'pointer', background:'white', border:'none', borderRadius:'5px'}}>Volver al Admin</button>
      </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '40px', fontFamily: 'sans-serif' }}>
       
       <div style={{maxWidth: 1400, margin: '0 auto'}}>
        {/* HEADER */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 40}}>
            <div>
                <h1 style={{ margin: 0, fontSize: 32, background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🚀 Centro de Comando</h1>
                <p style={{margin:'5px 0 0', color:'#64748b'}}>Visión global de tu negocio</p>
            </div>
            <button onClick={() => router.push('/admin')} style={{background:'#1e293b', color:'white', border:'1px solid #334155', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:'bold'}}>← Volver a la App</button>
        </div>

        {/* METRICAS (KPIs) */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:20, marginBottom:40}}>
            <MetricCard title="Ingresos Mensuales" value={`$${stats.income.toLocaleString()}`} icon="💰" color="#10b981" />
            <MetricCard title="Usuarios Totales" value={stats.total} icon="👥" color="#3b82f6" />
            <MetricCard title="Suscripciones Activas" value={stats.active} icon="⭐" color="#f59e0b" />
            <MetricCard title="En Prueba Gratis" value={stats.trial} icon="⏳" color="#64748b" />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 30 }}>
            {/* TABLA DE USUARIOS */}
            <div style={{ background: '#1e293b', borderRadius: 16, padding: 25, border:'1px solid #334155' }}>
                <h3 style={{marginTop:0, marginBottom:20}}>👥 Base de Datos de Usuarios ({users.length})</h3>
                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600}}>
                        <thead>
                            <tr style={{textAlign:'left', color:'#94a3b8', borderBottom:'1px solid #334155'}}>
                                <th style={{padding:10}}>Usuario</th>
                                <th style={{padding:10}}>Plan</th>
                                <th style={{padding:10}}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{borderBottom:'1px solid #334155'}}>
                                    <td style={{padding:10}}>
                                        <div style={{fontWeight:'bold'}}>{u.email}</div>
                                        <div style={{fontSize:11, color:'#64748b'}}>{u.nombre_dueno || 'Sin nombre'}</div>
                                    </td>
                                    <td style={{padding:10}}>
                                        <span style={{
                                            padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:'bold',
                                            background: u.plan === 'full' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                            color: u.plan === 'full' ? '#facc15' : '#60a5fa',
                                            border: u.plan === 'full' ? '1px solid #a16207' : '1px solid #1e40af'
                                        }}>
                                            {u.plan === 'full' ? 'FULL' : 'BÁSICO'}
                                        </span>
                                    </td>
                                    <td style={{padding:10}}>
                                        {u.subscription_status === 'active' ? '✅ Activo' : (u.subscription_status === 'trial' ? '⏳ Prueba' : '⛔ Inactivo')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* GESTOR DE CUPONES */}
            <div style={{ background: '#1e293b', borderRadius: 16, padding: 25, border:'1px solid #334155', height:'fit-content' }}>
                <h3 style={{marginTop:0}}>🎟️ Cupones</h3>
                <div style={{display:'flex', gap:5, marginBottom: 20}}>
                    <input type="text" placeholder="CÓDIGO" value={newCode} onChange={e => setNewCode(e.target.value)} style={{flex:1, padding:10, borderRadius:6, border:'1px solid #334155', background:'#0f172a', color:'white'}} />
                    <input type="number" placeholder="%" value={newDiscount} onChange={e => setNewDiscount(Number(e.target.value))} style={{width:50, padding:10, borderRadius:6, border:'1px solid #334155', background:'#0f172a', color:'white'}} />
                    <button onClick={handleCreateCoupon} style={{background:'#10b981', color:'white', border:'none', borderRadius:6, padding:'0 15px', cursor:'pointer'}}>+</button>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                    {coupons.map(c => (
                        <div key={c.id} style={{background:'#0f172a', padding:10, borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:'3px solid #3b82f6'}}>
                            <div><div style={{fontWeight:'bold'}}>{c.code}</div><div style={{fontSize:11, color:'#94a3b8'}}>{c.discount_percent}% OFF</div></div>
                            <button onClick={() => handleDeleteCoupon(c.id)} style={{background:'transparent', border:'none', cursor:'pointer', opacity:0.5}}>🗑️</button>
                        </div>
                    ))}
                    {coupons.length === 0 && <div style={{color:'#64748b', fontSize:12, textAlign:'center'}}>Sin cupones activos.</div>}
                </div>
            </div>
        </div>

       </div>
    </div>
  );
}

// Componente simple para las tarjetas de métricas
function MetricCard({ title, value, icon, color }: any) {
    return (
        <div style={{ background: '#1e293b', padding: 20, borderRadius: 12, borderBottom: `4px solid ${color}`, boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                <span style={{color:'#94a3b8', fontSize:12, fontWeight:'bold', textTransform:'uppercase'}}>{title}</span>
                <span style={{fontSize:24}}>{icon}</span>
            </div>
            <div style={{fontSize: 28, fontWeight:'bold', color:'white'}}>{value}</div>
        </div>
    )
}