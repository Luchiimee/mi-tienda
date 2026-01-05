'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useShop } from '../context/ShopContext';
import Sidebar from '../components/Sidebar';

export default function ProductsPage() {
  const { shopData, updateProduct, deleteProduct, addProduct, canEdit } = useShop();
  const router = useRouter();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkUser = async () => { const { data: { session } } = await supabase.auth.getSession(); if (!session) router.push('/login'); };
    checkUser();
  }, [router]);

  if (shopData.template === 'personal') {
      return (
        <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', alignItems:'center', justifyContent:'center' }}>
            <div style={{background:'white', padding:40, borderRadius:12, textAlign:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.05)', maxWidth:400}}>
                <h1 style={{fontSize:40, margin:0}}>🔒</h1>
                <p style={{color:'#64748b'}}>La plantilla Personal se edita desde "Personalizar".</p>
                <button onClick={() => router.push('/admin')} style={{padding:10, background:'#3b82f6', color:'white', border:'none', borderRadius:6, cursor:'pointer', marginTop:10}}>Volver</button>
            </div>
        </div>
      );
  }

  const handleImageUpload = async (e: any, productId: string, currentGallery: string[]) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
        const fileName = `${Date.now()}-${file.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('products').upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from('products').getPublicUrl(fileName);
        const newGallery = [...(currentGallery || []), data.publicUrl];
        updateProduct(productId, { galeria: newGallery });
    } catch (err:any) { alert(err.message); } finally { setUploading(false); }
  };

  const removeImage = (productId: string, gallery: string[], indexToRemove: number) => {
      if(!confirm("¿Borrar imagen?")) return;
      const newGallery = gallery.filter((_, i) => i !== indexToRemove);
      updateProduct(productId, { galeria: newGallery });
  };

  const handleCreate = async () => {
     if(!canEdit()) return alert("Configura tu plan primero.");
     await addProduct({ id: '', titulo: 'Nuevo Producto', descripcion: 'Descripción...', precio: '0', galeria: [], url: '' });
  };

  return (
    <div className="contenedor-layout">
      <Sidebar activeTab="productos" />
      <main className="main-content" style={{ padding: '40px', overflowY: 'auto', background: '#f1f5f9', width:'100%', display: 'flex', flexDirection: 'column', justifyContent:'flex-start'}}>
          
          <h1 style={{color:'#34495e', marginTop:0}}>Gestionar Productos</h1>
          <p style={{color:'#7f8c8d', marginBottom:30}}>Haz clic en el lápiz para editar su contenido.</p>

          {/* --- AQUÍ ESTÁ EL ARREGLO DEL GRID --- */}
          <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Esto fuerza que entren varias columnas de 300px minimo
              gap: '30px', 
              alignItems: 'start',
              width: '100%' 
          }}>
              
              {shopData.productos.map((p: any) => {
                  const isEditing = editingId === p.id;
                  const coverImage = (p.galeria && p.galeria.length > 0) ? p.galeria[0] : p.imagen;
                  const editorGallery = (p.galeria && p.galeria.length > 0) ? p.galeria : (p.imagen ? [p.imagen] : []);

                  return (
                      <div key={p.id} style={{ 
                          background: 'white', borderRadius: 12, overflow: 'hidden', 
                          boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
                          position: 'relative', minHeight: 400, transition: 'all 0.2s',
                          border: isEditing ? '2px solid #3498db' : '1px solid transparent',
                          display: 'flex', flexDirection: 'column'
                      }}>
                          
                          {/* VISTA NORMAL (CARD) */}
                          <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', opacity: isEditing ? 0 : 1 }}>
                                <div style={{width:'100%', height:200, background:'#f8fafc', borderRadius:8, marginBottom:15, position:'relative', overflow:'hidden', border:'1px solid #eee'}}>
                                    {coverImage ? <img src={coverImage} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, color:'#bdc3c7'}}>📷</div>}
                                    
                                    {/* LAPIZ FLOTANTE ARRIBA DERECHA */}
                                    <button onClick={() => setEditingId(p.id)} style={{position:'absolute', top:10, right:10, background:'white', width:32, height:32, borderRadius:'50%', border:'none', cursor:'pointer', boxShadow:'0 2px 5px rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#333'}}>✏️</button>
                                </div>
                                
                                <h3 style={{margin:'0 0 5px 0', color:'#2c3e50', fontSize:16}}>{p.titulo}</h3>
                                <p style={{margin:0, color:'#95a5a6', fontSize:13, flex:1, lineHeight:1.4}}>{p.descripcion}</p>
                                <div style={{marginTop:15, fontWeight:'bold', fontSize:20, color:'#2c3e50'}}>${p.precio}</div>
                          </div>

                          {/* VISTA EDITANDO (OVERLAY) */}
                          {isEditing && (
                              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(52, 73, 94, 0.98)', zIndex: 10, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white', animation: 'fadeIn 0.2s' }}>
                                  
                                  {/* TÍTULO GALERÍA */}
                                  <label style={{fontSize:10, fontWeight:'bold', textTransform:'uppercase', marginBottom:5, color:'#bdc3c7'}}>Galería</label>
                                  
                                  {/* TIRA DE IMÁGENES + BOTÓN SUBIR */}
                                  <div style={{display:'flex', gap:8, marginBottom:15, overflowX:'auto', paddingBottom:5}}>
                                      {editorGallery.map((img:string, idx:number) => (
                                          <div key={idx} style={{position:'relative', width:50, height:50, flexShrink:0}}>
                                              <img src={img} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:4, border:'1px solid #fff'}} />
                                              <button onClick={()=>removeImage(p.id, p.galeria || [], idx)} style={{position:'absolute', top:-5, right:-5, background:'red', color:'white', borderRadius:'50%', width:16, height:16, fontSize:10, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>×</button>
                                          </div>
                                      ))}
                                      
                                      <label style={{width:50, height:50, border:'1px dashed #fff', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:20, background:'rgba(255,255,255,0.1)'}}>
                                          {uploading ? '...' : '+'} <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, p.id, p.galeria || [])} style={{display:'none'}} />
                                      </label>
                                  </div>

                                  {/* INPUTS CON ETIQUETAS CLARAS */}
                                  <label style={{fontSize:11, fontWeight:'bold', marginBottom:3, color:'#bdc3c7'}}>NOMBRE</label>
                                  <input type="text" value={p.titulo} onChange={e => updateProduct(p.id, {titulo: e.target.value})} style={{marginBottom:10, padding:10, borderRadius:6, border:'none', width:'100%', color:'#333'}} />
                                  
                                  <label style={{fontSize:11, fontWeight:'bold', marginBottom:3, color:'#bdc3c7'}}>DESCRIPCIÓN</label>
                                  <textarea value={p.descripcion} onChange={e => updateProduct(p.id, {descripcion: e.target.value})} rows={3} style={{marginBottom:10, padding:10, borderRadius:6, border:'none', width:'100%', resize:'none', color:'#333'}} />
                                  
                                  <label style={{fontSize:11, fontWeight:'bold', marginBottom:3, color:'#bdc3c7'}}>PRECIO ($)</label>
                                  <input type="text" value={p.precio} onChange={e => updateProduct(p.id, {precio: e.target.value})} style={{marginBottom:20, padding:10, borderRadius:6, border:'none', width:'100%', color:'#333'}} />
                                  
                                  <div style={{display:'flex', gap:10}}>
                                      <button onClick={() => setEditingId(null)} style={{flex:1, background:'#27ae60', color:'white', border:'none', padding:10, borderRadius:6, cursor:'pointer', fontWeight:'bold'}}>Guardar</button>
                                      <button onClick={() => { if(confirm("¿Eliminar producto?")) deleteProduct(p.id); }} style={{background:'#c0392b', color:'white', border:'none', padding:10, borderRadius:6, cursor:'pointer'}}>Eliminar</button>
                                  </div>
                              </div>
                          )}
                      </div>
                  );
              })}

              {/* CARD DE "AGREGAR NUEVO" (SIEMPRE AL FINAL, EN CUADRÍCULA) */}
              <div 
                  onClick={handleCreate}
                  style={{ 
                      border: '2px dashed #3498db', borderRadius: 12, minHeight: 400, 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', background: 'rgba(52, 152, 219, 0.05)', color: '#3498db', transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(52, 152, 219, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(52, 152, 219, 0.05)'}
              >
                  <span style={{fontSize:60, marginBottom:10}}>+</span>
                  <span style={{fontWeight:'bold', fontSize:20}}>Agregar nuevo</span>
                  <span style={{fontSize:14, opacity:0.7, marginTop:5}}>Crear producto</span>
              </div>

          </div>
      </main>
      <style jsx global>{` @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } `}</style>
    </div>
  );
}