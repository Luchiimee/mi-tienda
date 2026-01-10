'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const ADMIN_EMAIL = 'luchiimee2@gmail.com'; 

export default function SuperAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  
  const [stats, setStats] = useState({ total: 0, simple: 0, full: 0, trial: 0, active: 0, income: 0 });
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        alert("⛔ Acceso denegado.");
        router.push('/admin'); 
        return;
      }
      await fetchData();
      setLoading(false);
    };
    checkAccess();
  }, [router]);

  const fetchData = async () => {
    const { data: shops } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
    
    if (shops) {
      setUsers(shops);
      
      let simple = 0, full = 0, trial = 0, active = 0, income = 0;

      shops.forEach(s => {
        if (s.plan === 'simple') simple++;
        if (s.plan === 'full') full++;
        if (s.subscription_status === 'trial') trial++;
        if (s.subscription_status === 'active') {
            active++;
            if (s.plan === 'simple') income += 15200;
            if (s.plan === 'full') income += 20100;
        }
      });

      setStats({ total: shops.length, simple, full, trial, active, income });
    }

    const { data: cup } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (cup) setCoupons(cup);
  };

  const handleCreateCoupon = async () => {
    if (!newCode) return;
    await supabase.from('coupons').insert([{ code: newCode.toUpperCase(), discount_percent: newDiscount, active: true }]);
    setNewCode(''); fetchData();
  };

  const handleDeleteCoupon = async (id: string) => {
    if(confirm("¿Borrar?")) { await supabase.from('coupons').delete().eq('id', id); fetchData(); }
  };

  if (loading) return <div style={{background:'#0f172a', height:'100vh', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>Cargando Panel...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '40px', fontFamily: 'sans-serif' }}>
      
      <div style={{maxWidth: 1400, margin: '0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 40}}>
            <div>
                <h1 style={{ margin: 0, fontSize: 32, background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🚀 Centro de Comando</h1>
                <p style={{margin:'5px 0 0', color:'#64748b'}}>Visión global de tu negocio</p>
            </div>
            <button onClick={() => router.push('/admin')} style={{background:'#1e293b', color:'white', border:'1px solid #334155', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:'bold'}}>← Volver a la App</button>
        </div>

        {/* --- 1. SECCIÓN DE MÉTRICAS (KPIs) --- */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:20, marginBottom:40}}>
            <MetricCard title="Ingresos Mensuales" value={`$${stats.income.toLocaleString()}`} icon="💰" color="#10b981" />
            <MetricCard title="Usuarios Totales" value={stats.total} icon="👥" color="#3b82f6" />
            <MetricCard title="Suscripciones Activas" value={stats.active} icon="⭐" color="#f59e0b" />
            <MetricCard title="En Prueba Gratis" value={stats.trial} icon="⏳" color="#64748b" />
        </div>

        {/* --- 2. BARRAS DE PROGRESO (PLANES) --- */}
        <div style={{background:'#1e293b', padding:25, borderRadius:16, marginBottom:40, border:'1px solid #334155'}}>
            <h3 style={{marginTop:0, marginBottom:20}}>Distribución de Planes</h3>
            
            <div style={{marginBottom:15}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:13}}>
                    <span>Plan Full ({stats.full})</span>
                    <span>{Math.round((stats.full / (stats.total || 1)) * 100)}%</span>
                </div>
                <div style={{height:8, background:'#334155', borderRadius:4, overflow:'hidden'}}>
                    <div style={{height:'100%', width:`${(stats.full / (stats.total || 1)) * 100}%`, background:'#eab308'}}></div>
                </div>
            </div>

            <div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:13}}>
                    <span>Plan Básico ({stats.simple})</span>
                    <span>{Math.round((stats.simple / (stats.total || 1)) * 100)}%</span>
                </div>
                <div style={{height:8, background:'#334155', borderRadius:4, overflow:'hidden'}}>
                    <div style={{height:'100%', width:`${(stats.simple / (stats.total || 1)) * 100}%`, background:'#3b82f6'}}></div>
                </div>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 30 }}>
            
            {/* --- 3. TABLA DE USUARIOS DETALLADA --- */}
            <div style={{ background: '#1e293b', borderRadius: 16, padding: 25, border:'1px solid #334155' }}>
                <h3 style={{marginTop:0, marginBottom:20}}>👥 Base de Datos de Usuarios</h3>
                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700}}>
                        <thead>
                            <tr style={{textAlign:'left', color:'#94a3b8', borderBottom:'1px solid #334155'}}>
                                <th style={{padding:12}}>Cliente</th>
                                <th style={{padding:12}}>Contacto</th>
                                <th style={{padding:12}}>Plan</th>
                                <th style={{padding:12}}>Estado</th>
                                <th style={{padding:12}}>Uso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                // Plantillas activas
                                const actives = [u.slug_tienda, u.slug_catalogo, u.slug_menu, u.slug_personal].filter(Boolean);
                                
                                return (
                                    <tr key={u.id} style={{borderBottom:'1px solid #334155', color:'#e2e8f0'}}>
                                        <td style={{padding:12}}>
                                            <div style={{fontWeight:'bold'}}>{u.nombre_dueno || 'Anónimo'} {u.apellido_dueno}</div>
                                            <div style={{fontSize:11, color:'#64748b'}}>ID: {u.id.substring(0,8)}...</div>
                                        </td>
                                        <td style={{padding:12}}>
                                            <div style={{display:'flex', alignItems:'center', gap:5}}>📧 {u.email || '-'}</div>
                                            <div style={{display:'flex', alignItems:'center', gap:5, marginTop:3, color:'#94a3b8'}}>📞 {u.telefono_dueno || 'Sin tel'}</div>
                                        </td>
                                        <td style={{padding:12}}>
                                            <span style={{
                                                padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:'bold',
                                                background: u.plan === 'full' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                color: u.plan === 'full' ? '#facc15' : '#60a5fa',
                                                border: u.plan === 'full' ? '1px solid #a16207' : '1px solid #1e40af'
                                            }}>
                                                {u.plan === 'full' ? '👑 FULL' : '🔹 BÁSICO'}
                                            </span>
                                        </td>
                                        <td style={{padding:12}}>
                                            {u.subscription_status === 'active' 
                                                ? <span style={{color:'#4ade80'}}>✅ Pagando</span> 
                                                : (u.subscription_status === 'trial' ? <span style={{color:'#fbbf24'}}>⏳ Prueba</span> : <span style={{color:'#f87171'}}>⛔ Inactivo</span>)
                                            }
                                        </td>
                                        <td style={{padding:12}}>
                                            <div style={{display:'flex', gap:5}}>
                                                {actives.length > 0 ? actives.length : '0'} / 4
                                                <span style={{color:'#64748b', fontSize:11}}>activas</span>
                                            </div>
                                            {u.templateLocked && <div style={{fontSize:10, color:'#f97316'}}>🔒 {u.templateLocked}</div>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 4. GESTOR DE CUPONES --- */}
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
                    {coupons.length === 0 && <div style={{color:'#64748b', fontSize:12, textAlign:'center'}}>Sin cupones.</div>}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

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