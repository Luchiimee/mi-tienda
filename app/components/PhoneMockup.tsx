'use client';

import { useShop } from '../context/ShopContext';
import { useState } from 'react';

export default function PhoneMockup() {
  const { shopData } = useShop();
  const [busqueda, setBusqueda] = useState('');

  const isDark = shopData.plantillaVisual === 'Moderna';
  const bgApp = isDark ? '#1a1a1a' : '#f8f8f8';
  const text = isDark ? '#ffffff' : '#333333';
  const cardBg = isDark ? '#333' : 'rgb(248, 248, 248)'; 
  const border = isDark ? '#444' : 'none';
  const accentColor = isDark ? '#5dade2' : '#3498db';

  const isGrid = shopData.template === 'tienda' || shopData.template === 'catalogo' || shopData.template === 'menu';
  const rowGapDinamico = shopData.template === 'menu' ? 60 : 15;

  const productosFiltrados = shopData.productos.filter((p: any) => 
    p.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getPersonalStyle = (theme: string) => {
    const base = { padding: '16px', borderRadius: '50px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' as const, marginBottom: '0px', cursor: 'pointer', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', color: 'white', background: accentColor };
    if (theme === 'neon') return { ...base, background: '#000', color: '#0f0', border: '2px solid #0f0', boxShadow: '0 0 10px #0f0' };
    if (theme === 'minimal') return { ...base, background: 'transparent', color: text, border: `2px solid ${text}`, boxShadow: 'none' };
    if (theme === 'glass') return { ...base, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', color: isDark?'white':'#333' };
    return base;
  };

  return (
    <div style={{ width: 320, height: 640, borderRadius: 40, border: '8px solid #2c3e50', background: bgApp, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', fontFamily: 'sans-serif' }}>
      <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width: 120, height: 25, background: '#2c3e50', borderBottomLeftRadius: 15, borderBottomRightRadius: 15, zIndex: 20 }}></div>

      <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 100, scrollbarWidth: 'none' }}>
        
        {/* HEADER */}
        <div style={{ padding: '40px 20px 10px 20px', textAlign: 'center' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#fff', margin: '0 auto 10px', overflow:'hidden', border: '2px solid #ff9f43', padding: 2 }}>
                <div style={{width:'100%', height:'100%', borderRadius:'50%', overflow:'hidden'}}>
                   {shopData.logo ? <img src={shopData.logo} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <span style={{fontSize:35, lineHeight:'60px'}}>😎</span>}
                </div>
            </div>
            <h2 style={{ margin: 0, fontSize: 18, color: text }}>{shopData.nombreNegocio || 'Tu Negocio'}</h2>
            
            {/* --- ESTO ES LO QUE FALTABA (LA DESCRIPCIÓN DEL NEGOCIO) --- */}
            <p style={{ margin: '5px 0 0', fontSize: 12, color: '#888', lineHeight: 1.3 }}>
                {shopData.descripcion || 'Aquí va la descripción de tu negocio...'}
            </p>
        </div>

        {/* BUSCADOR */}
        {shopData.template !== 'personal' && (
            <div style={{ padding: '0 15px', marginBottom: 15 }}>
                <div style={{ padding: '8px 15px', borderRadius: 50, fontSize: 12, backgroundColor: isDark ? '#333' : '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                     <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{border:'none', background:'transparent', outline:'none', color:'inherit', width:'100%', fontSize:12}} />
                     <span>🔍</span>
                </div>
            </div>
        )}

        {/* LISTA */}
        <div style={{ padding: '0 15px', display: isGrid ? 'grid' : 'flex', gridTemplateColumns: isGrid ? '1fr 1fr' : 'none', flexDirection: isGrid ? 'row' : 'column', gap: 12, rowGap: rowGapDinamico, marginTop: 25, paddingBottom: 80 }}>

            {/* PERSONAL */}
            {shopData.template === 'personal' && productosFiltrados.map((p: any) => (
                <div key={p.id} style={getPersonalStyle(shopData.personalTheme)}>{p.titulo}</div>
            ))}

            {/* TIENDA Y CATALOGO */}
            {(shopData.template === 'tienda' || shopData.template === 'catalogo') && productosFiltrados.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', backgroundColor: cardBg, boxShadow: '1px 1px 3px 1px #9d9d9d5e', width: '100%', gap: 10, borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: 250, background: 'white' }}>
                        {p.imagen ? (
                            <img src={p.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}/>
                        ) : (
                            <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, color:'#ccc'}}>📷</div>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '0 10px 15px 10px', width: '100%', textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold', fontSize: 14, color: isDark? 'white':'#333', marginBottom: 4, lineHeight: 1.2 }}>{p.titulo}</div>
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>{p.descripcion}</div>
                        <div style={{ fontWeight: 'bold', fontSize: 15, color: '#27ae60', marginBottom: 8 }}>
                            {(shopData.template === 'catalogo' && (!p.precio || p.precio === '0')) ? 'Consultar' : `$${p.precio}`}
                        </div>
                        <div style={{ width:'100%', padding:'8px 0', borderRadius: 8, background: isDark?'#444':'#e0e0e0', color: isDark?'#fff':'#555', textAlign:'center', fontSize:11, fontWeight:'bold' }}>
                            {shopData.template === 'catalogo' ? 'Seleccionar' : 'Agregar'}
                        </div>
                    </div>
                </div>
            ))}

            {/* MENU */}
            {shopData.template === 'menu' && productosFiltrados.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: cardBg, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: '0 10px 15px 10px', borderRadius: 12, marginTop: 45, overflow: 'visible', position: 'relative', width: '100%' }}>
                    <div style={{ marginTop: -40, width: 90, height: 90, borderRadius: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', backgroundColor: '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                         {p.imagen ? <img src={p.imagen} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div style={{fontSize:40}}>🍔</div>}
                    </div>
                    <div style={{textAlign:'center', width: '100%', marginTop: 10}}>
                        <div style={{ fontWeight: 'bold', color: text, fontSize: 13, lineHeight: 1.2 }}>{p.titulo}</div>
                        <div style={{ fontSize: 9, color: '#999', marginTop: 2 }}>{p.descripcion}</div>
                        <div style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 14, marginTop: 5 }}>${p.precio}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 8 }}>
                        <div style={{width:22, height:22, borderRadius:'50%', border:'1px solid #ddd', color:'#e74c3c', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14}}>-</div>
                        <span style={{fontWeight:'bold', fontSize:12}}>0</span>
                        <div style={{width:22, height:22, borderRadius:'50%', border:'1px solid #ddd', color:'#27ae60', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14}}>+</div>
                    </div>
                </div>
            ))}
        </div>

        {/* FOOTER */}
        {(shopData.template !== 'personal') && (
            <div style={{ position:'absolute', bottom:0, left:0, width:'100%', padding:'10px 15px', background: isDark ? '#222' : 'white', borderTop:`1px solid #eee`, display:'flex', justifyContent:'space-between', alignItems:'center', zIndex: 100}}>
                <div style={{fontSize:10, color:'#888'}}>Total: <b style={{color:text}}>$0</b></div>
                <div style={{background:'#25D366', color:'white', padding:'6px 12px', borderRadius:20, fontSize:10, fontWeight:'bold'}}>WhatsApp</div>
                
            </div>
        )}
      </div>
    </div>
  );
}