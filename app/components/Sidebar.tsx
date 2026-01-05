'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useShop, Product } from '../context/ShopContext';
import { supabase } from '@/lib/supabaseClient'; 
import { useRouter } from 'next/navigation';

interface SidebarProps { activeTab?: 'personalizar' | 'productos' | 'configuracion'; }

export default function Sidebar({ activeTab = 'personalizar' }: SidebarProps) {
  const { shopData, updateConfig, updateProduct, addProduct, changeTemplate, canEdit, manualSave } = useShop();
  const router = useRouter();
  const [plantillasAbierto, setPlantillasAbierto] = useState(true);
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(null);
  const [indexEditando, setIndexEditando] = useState(0); 
  const [origin, setOrigin] = useState('');
  const [uploading, setUploading] = useState(false);

  const productoActivo = shopData.productos[indexEditando] || shopData.productos[0];

  useEffect(() => { if (typeof window !== 'undefined') setOrigin(window.location.origin); }, []);
  const togglePlantillas = () => setPlantillasAbierto(!plantillasAbierto);
  const toggleAcordeon = (seccion: string) => setSeccionAbierta(seccionAbierta === seccion ? null : seccion);
  
  const checkEdit = () => { if (!canEdit()) { if(window.confirm("⚠️ Configura tu plan primero.")) router.push('/configuracion'); return false; } return true; };
  const handleChange = (e: any) => { if (!checkEdit()) return; updateConfig({ [e.target.name]: e.target.value }); };
  const handleProductEdit = (e: any) => { if (!checkEdit()) return; if (!productoActivo) return; updateProduct(productoActivo.id, { [e.target.name]: e.target.value }); };
  
  // FUNCION GUARDAR
  const handleSaveClick = async () => { await manualSave(); alert("✅ ¡Guardado correctamente!"); };
  // --- SUBIDA DE LOGO (TIENDA) ---
  const handleLogoUpload = async (e: any) => {
      if (!checkEdit()) return;
      const file = e.target.files[0];
      if (!file) return;
      
      // Reutilizamos el estado uploading o creamos uno local si prefieres, 
      // por simpleza usaremos el mismo setUploading visual
      setUploading(true); 
      try {
          const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`;
          const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
          
          // Actualizamos la configuración de la tienda con la nueva URL
          updateConfig({ logo: publicUrl });
      } catch (error: any) {
          alert('Error subiendo logo: ' + error.message);
      } finally {
          setUploading(false);
      }
  };

  const handleImageUpload = async (e: any) => {
      if (!checkEdit() || !productoActivo) return;
      const file = e.target.files[0]; if (!file) return;
      setUploading(true);
      try {
          const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
          const { error } = await supabase.storage.from('products').upload(fileName, file);
          if(error) throw error;
          const { data } = supabase.storage.from('products').getPublicUrl(fileName);
          updateProduct(productoActivo.id, { imagen: data.publicUrl });
      } catch(e:any) { alert(e.message); } finally { setUploading(false); }
  };

  const selectTemplate = (val: string) => { if (shopData.plan === 'simple' && shopData.templateLocked && shopData.templateLocked !== val) return; changeTemplate(val); setIndexEditando(0); };
  const copierLink = () => { if(!shopData.slug) return alert("Define un link primero"); navigator.clipboard.writeText(`${origin}/${shopData.slug}`); alert('Copiado!'); };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  const limitItems = shopData.template === 'personal' ? 4 : 2;
  const agregarSiguienteProducto = () => {
    if (!checkEdit()) return;
    if (shopData.template === 'personal' && shopData.productos.length >= 4) { alert("✋ Máximo 4 enlaces."); return; }
    if (shopData.productos.length >= 2 && shopData.template !== 'personal') { if(confirm("¿Ir a Productos?")) router.push('/productos'); return; } 
    addProduct({ id: Date.now().toString(), titulo: 'Nuevo', descripcion: '', precio: '', imagen: '', url: '#' }); 
    setIndexEditando(shopData.productos.length); 
  };
  const templates = [ { id: 'tienda', icon: '🛒', label: 'Tienda' }, { id: 'catalogo', icon: '📖', label: 'Catálogo' }, { id: 'menu', icon: '🍔', label: 'Menú' }, { id: 'personal', icon: '👤', label: 'Personal' } ];

  return (
    <aside className="sidebar">
      <div style={{marginBottom: 20}}>
        <h1 style={{fontSize:18, margin:0}}>Hola {shopData.nombreAdmin}</h1>
        <span style={{fontSize:12, color:'#95a5a6'}}>Panel Admin</span>
      </div>
      <nav style={{ marginBottom: '20px' }}>
        <ul>
          <li className={activeTab === 'personalizar' ? 'activo' : ''}><Link href="/admin" style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>🖌️ Personalizar</Link></li>
          <li className={activeTab === 'productos' ? 'activo' : ''} style={{opacity: shopData.template === 'personal' ? 0.5 : 1}}><Link href="/productos" onClick={(e) => shopData.template === 'personal' && e.preventDefault()} style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit', cursor: shopData.template === 'personal' ? 'not-allowed' : 'pointer' }}>📦 Productos</Link></li>
          <li className={activeTab === 'configuracion' ? 'activo' : ''}><Link href="/configuracion" style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>⚙️ Configuración</Link></li>
        </ul>
      </nav>

      {activeTab === 'personalizar' && (
        <div className="ajustes-sidebar">
          {/* PLANTILLA */}
          <div className={`card-ajuste ${plantillasAbierto ? 'activo' : ''}`}>
            <div className="ajuste-header" onClick={togglePlantillas}><span className="icono">🎨</span> Plantilla <span className="flecha">▼</span></div>
            <div className={`ajuste-body ${plantillasAbierto ? 'mostrar' : ''}`}>
               <div className="grid-plantillas">
                {templates.map((t) => {
                  const isSelected = shopData.template === t.id;
                  const isDisabled = shopData.plan === 'simple' && shopData.templateLocked && shopData.templateLocked !== t.id;
                  return (
                    <div key={t.id} className={`item-plantilla ${isSelected ? 'seleccionada' : ''}`} onClick={() => selectTemplate(t.id)} style={{opacity: isDisabled ? 0.3 : 1, filter: isDisabled ? 'grayscale(100%)' : 'none', cursor: isDisabled ? 'not-allowed' : 'pointer', border: isSelected && (shopData.plan==='simple' && shopData.templateLocked) ? '2px solid #f1c40f' : ''}}>
                        <div className="icono-grande">{t.icon}</div><span style={{textTransform:'capitalize', fontWeight:'bold'}}>{t.label}</span>
                    </div>
                  );
                })}
               </div>
            </div>
          </div>
{/* DATOS */}
          <div className={`card-ajuste ${seccionAbierta === 'datos' ? 'activo' : ''}`}>
            <div className="ajuste-header" onClick={() => toggleAcordeon('datos')}><span className="icono">📝</span> Datos <span className="flecha">▼</span></div>
            <div className={`ajuste-body ${seccionAbierta === 'datos' ? 'mostrar' : ''}`}>
              <label>Nombre</label><input type="text" name="nombreNegocio" value={shopData.nombreNegocio} onChange={handleChange} />
              <label>Descripción</label><input type="text" name="descripcion" value={shopData.descripcion} onChange={handleChange} />
              <label>WhatsApp</label><input type="text" name="whatsapp" value={shopData.whatsapp} onChange={handleChange} />
              
              {/* --- LOGO UPLOADER --- */}
              <div style={{marginTop: 10}}>
                  <label style={{fontSize:11, fontWeight:'bold', color:'#7f8c8d', display:'block', marginBottom:5}}>Logo del Negocio</label>
                  
                  <label htmlFor="logo-upload" style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      padding: '10px', border: '1px dashed #3498db', borderRadius: '6px', 
                      cursor: 'pointer', color: '#3498db', fontSize: '11px', fontWeight: '500', 
                      background: 'white', textAlign: 'center' 
                  }}>
                      {uploading ? '⏳ Subiendo...' : (shopData.logo ? '🔄 Cambiar Logo' : '📁 Subir Logo')}
                      <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} style={{display:'none'}} />
                  </label>

                  {shopData.logo && (
                      <div style={{marginTop:5, display:'flex', alignItems:'center', gap:10, fontSize:10, color:'#27ae60'}}>
                          ✅ Logo cargado:
                          <img src={shopData.logo} style={{width:30, height:30, borderRadius:'50%', objectFit:'cover', border:'1px solid #ddd'}} />
                      </div>
                  )}
              </div>
              {/* --------------------- */}

              {shopData.template !== 'personal' && <select name="plantillaVisual" value={shopData.plantillaVisual} onChange={handleChange} style={{marginTop:10}}><option value="Minimal">Claro</option><option value="Moderna">Oscuro</option></select>}
              
              {/* BOTON GUARDAR EN DATOS */}
              <button onClick={handleSaveClick} style={{marginTop:15, width:'100%', padding:8, background:'#2c3e50', color:'white', border:'none', borderRadius:4, cursor:'pointer', fontWeight:'bold'}}>💾 Guardar Datos</button>
            </div>
          </div>

          {/* LINK (CON BOTON GUARDAR Y COPIAR) */}
          <div className={`card-ajuste ${seccionAbierta === 'link' ? 'activo' : ''}`}>
            <div className="ajuste-header" onClick={() => toggleAcordeon('link')}><span className="icono">🔗</span> Link {shopData.template} <span className="flecha">▼</span></div>
            <div className={`ajuste-body ${seccionAbierta === 'link' ? 'mostrar' : ''}`}>
               <div className="grupo-link" style={{flexDirection:'column', alignItems:'flex-start', gap:8, marginTop:5}}>
                  <span className="dominio-fijo" style={{fontSize:11, color:'#7f8c8d'}}>{origin}/</span>
                  <input type="text" name="slug" value={shopData.slug} onChange={handleChange} style={{fontWeight:'bold', color:'#3498db', width:'100%'}}/>
               </div>
               <div style={{display:'flex', gap:5, marginTop:10}}>
                   <button className="btn-copiar" onClick={handleSaveClick} style={{background:'#156335ff', flex:1}}>Guardar</button>
                   <button className="btn-copiar" onClick={copierLink} style={{flex:1}}>Copiar</button>
               </div>
            </div>
          </div>
          
        {/* ITEM RÁPIDO */}
          <div className={`card-ajuste ${seccionAbierta === 'productos' ? 'activo' : ''}`}>
             <div className="ajuste-header" onClick={() => toggleAcordeon('productos')}><span className="icono">{shopData.template === 'personal' ? '🔗' : '📦'}</span> Item Rápido <span className="flecha">▼</span></div>
             <div className={`ajuste-body ${seccionAbierta === 'productos' ? 'mostrar' : ''}`}>
                 <div style={{display:'flex', gap:5, marginBottom:15, marginTop:5, flexWrap:'wrap', alignItems:'center'}}>
                    {shopData.productos.slice(0, limitItems).map((_:any,i:number)=>(<button key={i} onClick={()=>setIndexEditando(i)} style={{padding:'5px', background:indexEditando===i?'#3498db':'#2c3e50', color:indexEditando===i?'white':'#bdc3c7', borderRadius:4, border:'none', fontSize:11, width:25, height:25}}>#{i+1}</button>))}
                    <button onClick={agregarSiguienteProducto} style={{background:'#2ecc71', color:'white', border:'none', borderRadius:4, width:25, height:25, cursor:'pointer', fontWeight:'bold', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center'}} title="Agregar">+</button>
                 </div>
                 {productoActivo ? (
                    <div style={{display:'flex', flexDirection:'column', gap:10}}>
                        {shopData.template !== 'personal' ? (
                            <>
                                <div><label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d'}}>Nombre</label><input type="text" name="titulo" value={productoActivo.titulo} onChange={handleProductEdit}/></div>
                                
                                {/* AGREGADO: CAMPO DESCRIPCIÓN */}
                                <div><label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d'}}>Descripción</label><input type="text" name="descripcion" value={productoActivo.descripcion} onChange={handleProductEdit}/></div>
                                
                                <div><label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d'}}>Precio</label><input type="text" name="precio" value={productoActivo.precio} onChange={handleProductEdit}/></div>
                                <div>
                                    <label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d', display:'block', marginBottom:5}}>Imagen</label>
                                    <label htmlFor={`sidebar-upload-${productoActivo.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', border: '1px dashed #3498db', borderRadius: '6px', cursor: 'pointer', color: '#3498db', fontSize: '11px', fontWeight: '500', backgroundColor: uploading ? '#f0f8ff' : 'white', textAlign: 'center' }}>
                                        {uploading ? '⏳...' : (productoActivo.imagen ? '🔄 Cambiar' : '📁 Seleccionar')}
                                        <input id={`sidebar-upload-${productoActivo.id}`} type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
                                    </label>
                                    {productoActivo.imagen && !uploading && <div style={{marginTop:5, fontSize:10, color:'#27ae60', display:'flex', alignItems:'center', gap:5}}>✅ Cargada <img src={productoActivo.imagen} style={{width:20, height:20, objectFit:'cover', borderRadius:3}} /></div>}
                                </div>
                            </>
                        ) : (
                            <>
                                <div><label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d'}}>Texto Botón</label><input type="text" name="titulo" value={productoActivo.titulo} onChange={handleProductEdit}/></div>
                                <div><label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d'}}>Link Destino</label><input type="text" name="url" value={productoActivo.url} onChange={handleProductEdit}/></div>
                            </>
                        )}
                        {shopData.template !== 'personal' && <div style={{marginTop:5, textAlign:'center'}}><Link href="/productos" style={{fontSize:11, color:'#3498db', textDecoration:'none'}}>Ver todos los detalles →</Link></div>}
                    </div>
                 ) : <span>Carga un ítem (+)</span>}
                 {shopData.template === 'personal' && (
                   <div style={{marginTop:20, borderTop:'1px solid #465f76', paddingTop:15}}>
                       <label style={{marginBottom:10, display:'block', fontSize:11, color:'#bdc3c7'}}>Estilo de botones:</label>
                       <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                           <button onClick={() => updateConfig({personalTheme: 'glass'})} style={{background: 'linear-gradient(45deg, #667eea, #764ba2)', color:'white', padding:8, borderRadius:5, fontSize:10, border: shopData.personalTheme==='glass'?'2px solid white':'none'}}>Glass</button>
                           <button onClick={() => updateConfig({personalTheme: 'minimal'})} style={{background: '#ecf0f1', color:'#333', padding:8, borderRadius:5, fontSize:10, border: shopData.personalTheme==='minimal'?'2px solid #3498db':'none'}}>Minimal</button>
                           <button onClick={() => updateConfig({personalTheme: 'neon'})} style={{background: '#000', color:'#0f0', padding:8, borderRadius:5, fontSize:10, border: shopData.personalTheme==='neon'?'2px solid white':'1px solid #0f0'}}>Neon</button>
                           <button onClick={() => updateConfig({personalTheme: 'flat'})} style={{background: '#e74c3c', color:'white', padding:8, borderRadius:5, fontSize:10, border: shopData.personalTheme==='flat'?'2px solid white':'none'}}>Flat</button>
                       </div>
                   </div>
                 )}
             </div>
          </div>
        </div>
      )}
      <hr style={{margin:'20px 0', borderColor:'#34495e'}}/>
      <div className="producto"><button><a href={`/${shopData.slug}`} target="_blank">Ver {shopData.template} →</a></button></div>
      <div className="cerrar-sesion"><button onClick={handleLogout} style={{color:'#ffffffff', textAlign: 'center'}}>Salir</button></div>
    </aside>
  );
}