'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// ⚠️ IMPORTANTE: PON TU EMAIL EXACTO AQUÍ PARA LA PROTECCIÓN FRONTEND
const ADMIN_EMAIL = 'luchiimee2@gmail.com'; 

export default function SuperAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  
  // Stats
  const [stats, setStats] = useState({ total: 0, simple: 0, full: 0, trial: 0, income: 0 });

  // Formulario Cupones
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Bloqueo de seguridad
      if (!user || user.email !== ADMIN_EMAIL) {
        alert("⛔ Acceso denegado. Área restringida.");
        router.push('/admin'); // Lo mandamos a su casa
        return;
      }

      await fetchData();
      setLoading(false);
    };
    checkAccess();
  }, [router]);

  const fetchData = async () => {
    // 1. Traer TODOS los usuarios (gracias a la Policy que creamos en SQL)
    const { data: shops } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
    
    if (shops) {
      setUsers(shops);
      
      // Calcular métricas
      let simpleCount = 0;
      let fullCount = 0;
      let trialCount = 0;
      let estimatedIncome = 0;

      shops.forEach(s => {
        if (s.plan === 'simple') simpleCount++;
        if (s.plan === 'full') fullCount++;
        if (s.subscription_status === 'trial') trialCount++;
        
        // Calcular plata (solo de activos)
        if (s.subscription_status === 'active') {
            if (s.plan === 'simple') estimatedIncome += 15200;
            if (s.plan === 'full') estimatedIncome += 20100;
        }
      });

      setStats({
        total: shops.length,
        simple: simpleCount,
        full: fullCount,
        trial: trialCount,
        income: estimatedIncome
      });
    }

    // 2. Traer Cupones
    const { data: cup } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (cup) setCoupons(cup);
  };

  const handleCreateCoupon = async () => {
    if (!newCode) return alert("Escribe un código");
    
    const { error } = await supabase.from('coupons').insert([{
      code: newCode.toUpperCase(),
      discount_percent: newDiscount,
      active: true
    }]);

    if (error) alert("Error: " + error.message);
    else {
      setNewCode('');
      fetchData(); // Recargar lista
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if(!confirm("¿Borrar cupón?")) return;
    await supabase.from('coupons').delete().eq('id', id);
    fetchData();
  };

  if (loading) return <div style={{padding:50, textAlign:'center'}}>🕵️‍♂️ Verificando credenciales...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#1e293b', color: 'white', padding: '40px', fontFamily: 'sans-serif' }}>
      
      <div style={{maxWidth: 1200, margin: '0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 40}}>
            <h1 style={{ margin: 0, fontSize: 28 }}>🕵️‍♂️ Super Admin Panel</h1>
            <button onClick={() => router.push('/admin')} style={{background:'rgba(255,255,255,0.1)', color:'white', border:'none', padding:'10px 20px', borderRadius:8, cursor:'pointer'}}>← Volver a la App</button>
        </div>

        {/* --- 1. TARJETAS DE MÉTRICAS --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
            <Card title="Usuarios Totales" value={stats.total} icon="👥" color="#3b82f6" />
            <Card title="Plan Full" value={stats.full} icon="👑" color="#eab308" />
            <Card title="Plan Básico" value={stats.simple} icon="🔹" color="#64748b" />
            <Card title="En Prueba (Trial)" value={stats.trial} icon="⏳" color="#f97316" />
            <Card title="Ingresos Mensuales" value={`$${stats.income.toLocaleString()}`} icon="💸" color="#22c55e" isMoney />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 30 }}>
            
            {/* --- 2. LISTA DE USUARIOS --- */}
            <div style={{ background: '#334155', borderRadius: 16, padding: 25, boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                <h3 style={{marginTop:0}}>👥 Usuarios Registrados</h3>
                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 600}}>
                        <thead>
                            <tr style={{textAlign:'left', color:'#94a3b8', borderBottom:'1px solid #475569'}}>
                                <th style={{padding:10}}>Usuario</th>
                                <th style={{padding:10}}>Plan</th>
                                <th style={{padding:10}}>Estado</th>
                                <th style={{padding:10}}>Plantillas Usadas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                // Contar plantillas activas
                                let activeTmpls = 0;
                                if(u.slug_tienda) activeTmpls++;
                                if(u.slug_catalogo) activeTmpls++;
                                if(u.slug_menu) activeTmpls++;
                                if(u.slug_personal) activeTmpls++;

                                return (
                                    <tr key={u.id} style={{borderBottom:'1px solid #475569'}}>
                                        <td style={{padding:10}}>
                                            <div style={{fontWeight:'bold'}}>{u.nombre_dueno || 'Sin Nombre'} {u.apellido_dueno}</div>
                                            <div style={{fontSize:11, color:'#94a3b8'}}>{u.email || 'Email oculto por seguridad'}</div> 
                                            {/* Nota: Supabase a veces no devuelve el email en la tabla pública shops si no lo guardamos explícitamente. 
                                                Si lo guardamos en context, debería estar. Si no, veremos 'Admin' */}
                                        </td>
                                        <td style={{padding:10}}>
                                            <span style={{
                                                padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:'bold',
                                                background: u.plan === 'full' ? '#fef3c7' : '#dbeafe',
                                                color: u.plan === 'full' ? '#d97706' : '#1e40af'
                                            }}>
                                                {u.plan.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{padding:10}}>
                                            <span style={{color: u.subscription_status === 'active' ? '#4ade80' : '#fbbf24'}}>
                                                {u.subscription_status === 'active' ? '✅ Activo' : (u.subscription_status === 'trial' ? '⏳ Prueba' : '❌ Cancelado')}
                                            </span>
                                        </td>
                                        <td style={{padding:10}}>
                                            {u.plan === 'full' ? `${activeTmpls} / 4` : (u.templateLocked ? `1 (${u.templateLocked})` : '0')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 3. GESTOR DE CUPONES --- */}
            <div style={{ background: '#334155', borderRadius: 16, padding: 25, boxShadow: '0 4px 6px rgba(0,0,0,0.3)', height:'fit-content' }}>
                <h3 style={{marginTop:0}}>🎟️ Cupones de Descuento</h3>
                
                <div style={{display:'flex', gap:10, marginBottom: 20}}>
                    <input 
                        type="text" placeholder="CÓDIGO (Ej: SNAPPY20)" 
                        value={newCode} onChange={e => setNewCode(e.target.value)}
                        style={{flex:1, padding:10, borderRadius:6, border:'none', background:'#1e293b', color:'white'}}
                    />
                    <input 
                        type="number" placeholder="%" 
                        value={newDiscount} onChange={e => setNewDiscount(Number(e.target.value))}
                        style={{width:60, padding:10, borderRadius:6, border:'none', background:'#1e293b', color:'white'}}
                    />
                    <button onClick={handleCreateCoupon} style={{background:'#3b82f6', color:'white', border:'none', borderRadius:6, padding:'0 15px', cursor:'pointer', fontWeight:'bold'}}>+</button>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                    {coupons.map(c => (
                        <div key={c.id} style={{background:'#1e293b', padding:10, borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:'4px solid #10b981'}}>
                            <div>
                                <div style={{fontWeight:'bold', color:'#10b981'}}>{c.code}</div>
                                <div style={{fontSize:11, color:'#94a3b8'}}>{c.discount_percent}% OFF</div>
                            </div>
                            <button onClick={() => handleDeleteCoupon(c.id)} style={{background:'transparent', border:'none', cursor:'pointer', fontSize:14}}>🗑️</button>
                        </div>
                    ))}
                    {coupons.length === 0 && <div style={{color:'#94a3b8', fontSize:12, textAlign:'center'}}>No hay cupones activos.</div>}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// Componente simple para las tarjetitas de arriba
function Card({ title, value, icon, color, isMoney }: any) {
    return (
        <div style={{ background: '#334155', padding: 20, borderRadius: 12, borderTop: `4px solid ${color}`, boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                <span style={{color:'#94a3b8', fontSize:12, fontWeight:'bold', textTransform:'uppercase'}}>{title}</span>
                <span style={{fontSize:20}}>{icon}</span>
            </div>
            <div style={{fontSize: 24, fontWeight:'bold', color:'white'}}>{value}</div>
        </div>
    )
}