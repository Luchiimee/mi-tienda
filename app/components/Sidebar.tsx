'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useShop } from '../context/ShopContext';
import { supabase } from '@/lib/supabaseClient'; 
import { useRouter } from 'next/navigation';
import { DOMAIN_URL } from '@/lib/constants';
import UpgradeModal from './UpgradeModal'; 

interface SidebarProps { activeTab?: 'personalizar' | 'productos' | 'configuracion' | 'superadmin'; }

export default function Sidebar({ activeTab = 'personalizar' }: SidebarProps) {
  const { shopData, updateConfig, updateProduct, addProduct, deleteProduct, changeTemplate, canEdit, manualSave } = useShop();
  const router = useRouter();
  
  const [plantillasAbierto, setPlantillasAbierto] = useState(true);
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(null);
  const [indexEditando, setIndexEditando] = useState(0); 
  const [uploading, setUploading] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [localGallery, setLocalGallery] = useState<string[]>([]);
  
  // ESTADO PARA EL MODAL
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const limitItems = shopData.template === 'personal' ? 4 : 2;
  const productoActivo = shopData.productos[indexEditando];

  useEffect(() => {
      if (productoActivo) {
          const savedGallery = Array.isArray(productoActivo.galeria) && productoActivo.galeria.length > 0
              ? productoActivo.galeria 
              : (productoActivo.imagen ? [productoActivo.imagen] : []);
          setLocalGallery(savedGallery);
      } else {
          setLocalGallery([]);
      }
  }, [productoActivo?.id]);

  const togglePlantillas = () => setPlantillasAbierto(!plantillasAbierto);
  const toggleAcordeon = (seccion: string) => setSeccionAbierta(seccionAbierta === seccion ? null : seccion);
  
  // --- FUNCIÓN CENTRALIZADA DE SEGURIDAD ---
  const checkEdit = () => { 
      if (!canEdit()) { 
          setShowUpgradeModal(true);
          return false; 
      } 
      return true; 
  };

  const handleChange = (e: any) => { if (!checkEdit()) return; updateConfig({ [e.target.name]: e.target.value }); };
  
  const handleProductEdit = (e: any) => { 
      if (!checkEdit()) return; 
      if (!productoActivo) return; 
      updateProduct(productoActivo.id, { [e.target.name]: e.target.value }); 
  };
  
  const handleDeleteItem = async () => {
      if (!checkEdit()) return;
      if (!productoActivo) return;
      if (confirm("¿Estás seguro de eliminar este ítem?")) {
          await deleteProduct(productoActivo.id);
          setIndexEditando(0); 
      }
  };
  
  const handleSaveClick = async () => { 
      if(!checkEdit()) return;
      await manualSave(); 
      alert("✅ ¡Guardado correctamente!"); 
  };

  const copierLink = () => { 
      if(!shopData.slug) return alert("Define un link primero"); 
      navigator.clipboard.writeText(`${DOMAIN_URL}/${shopData.slug}`); 
      alert('¡Link copiado!'); 
  };

  const handleLogoUpload = async (e: any) => {
      if (!checkEdit()) return;
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true); 
      try {
          const fileName = `logo-${shopData.template}-${Date.now()}.${file.name.split('.').pop()}`;
          const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
          const finalUrl = `${publicUrl}?t=${Date.now()}`;
          updateConfig({ logo: finalUrl });
      } catch (error: any) { alert('Error subiendo logo: ' + error.message); } finally { setUploading(false); }
  };

  const handleImageUpload = async (e: any) => { 
      if (!checkEdit() || !productoActivo) return;
      const file = e.target.files[0]; 
      if (!file) return; 
      
      setUploading(true);
      try { 
          const fileName = `prod-${Date.now()}.${file.name.split('.').pop()}`;
          const { error } = await supabase.storage.from('products').upload(fileName, file);
          if(error) throw error;
          const { data } = supabase.storage.from('products').getPublicUrl(fileName);
          const newUrl = data.publicUrl;

          const newGallery = [...localGallery, newUrl];
          setLocalGallery(newGallery);

          updateProduct(productoActivo.id, { galeria: newGallery, imagen: newGallery[0] });
      } catch(err: any) { alert("Error imagen: " + err.message); } finally { setUploading(false); }
  };

  const removeImage = (indexToRemove: number) => {
      if (!checkEdit() || !productoActivo) return;
      const newGallery = localGallery.filter((_, idx) => idx !== indexToRemove);
      setLocalGallery(newGallery);
      updateProduct(productoActivo.id, { galeria: newGallery, imagen: newGallery.length > 0 ? newGallery[0] : '' });
  };

  const handleDragStart = (index: number) => setDraggedItemIndex(index);
  const handleDragOver = (e: any) => e.preventDefault();
  const handleDrop = (targetIndex: number) => {
      if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;
      const newGallery = [...localGallery];
      const itemToMove = newGallery[draggedItemIndex];
      newGallery.splice(draggedItemIndex, 1);
      newGallery.splice(targetIndex, 0, itemToMove);
      setLocalGallery(newGallery);
      updateProduct(productoActivo.id, { galeria: newGallery, imagen: newGallery[0] });
      setDraggedItemIndex(null);
  };

  const selectTemplate = (val: string) => { 
      if (shopData.plan === 'simple' && shopData.templateLocked && shopData.templateLocked !== val) {
          alert("🔒 Tu Plan Básico está bloqueado en la plantilla: " + shopData.templateLocked.toUpperCase());
          return;
      } 
      changeTemplate(val); 
      setIndexEditando(0); 
  };
  
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  const agregarSiguienteProducto = () => {
    if (!checkEdit()) return;
    if (shopData.productos.length >= limitItems) { 
        if(confirm(`El Item Rápido muestra solo los primeros ${limitItems}. ¿Ir a Productos para ver todos?`)) router.push('/productos'); 
        return; 
    } 
    addProduct({ id: Date.now().toString(), titulo: 'Nuevo', descripcion: '', precio: '', imagen: '', galeria: [], url: '#' }); 
    setIndexEditando(shopData.productos.length); 
  };

  const templates = [ { id: 'tienda', icon: '🛒', label: 'Tienda' }, { id: 'catalogo', icon: '📖', label: 'Catálogo' }, { id: 'menu', icon: '🍔', label: 'Menú' }, { id: 'personal', icon: '👤', label: 'Personal' } ];
  const currentLogo = shopData.logos?.[shopData.template] || shopData.logo;
  const itemsRapidos = shopData.productos.slice(0, limitItems);

  return (
    <>
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

      <aside 
        className="sidebar" 
        style={{ 
            height: '100vh', 
            position: 'sticky', 
            top: 0, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}
      >
        <div style={{marginBottom: 20}}>
          <h1 style={{fontSize:18, margin:0}}>Hola {shopData.nombreAdmin}</h1>
          <span style={{fontSize:12, color:'#95a5a6'}}>Panel Admin</span>
        </div>
        
        {/* --- NAV MODIFICADA CON BOTÓN SUPER ADMIN --- */}
        <nav style={{ marginBottom: '20px' }}>
          <ul>
            <li className={activeTab === 'personalizar' ? 'activo' : ''}><Link href="/admin" style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>🖌️ Personalizar</Link></li>
            <li className={activeTab === 'productos' ? 'activo' : ''} style={{opacity: shopData.template === 'personal' ? 0.5 : 1}}>
                <Link 
                  href="/productos" 
                  onClick={(e) => {
                      if(shopData.template === 'personal') {
                          e.preventDefault();
                          alert("⚠️ En la plantilla Personal (Links), no se usa el gestor de Productos avanzado.\n\nPuedes editar tus botones directamente desde el 'Item Rápido' aquí en el panel lateral.");
                      }
                  }} 
                  style={{ 
                      display: 'flex', alignItems: 'center', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit', 
                      cursor: shopData.template === 'personal' ? 'not-allowed' : 'pointer' 
                  }}
                >
                    📦 Productos
                </Link>
            </li>
            <li className={activeTab === 'configuracion' ? 'activo' : ''}><Link href="/configuracion" style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>⚙️ Configuración</Link></li>
            
            {/* ⚠️ BOTÓN SECRETO SUPER ADMIN (Solo para luchiimee@gmail.com) */}
            {shopData.email === 'luchiimee@gmail.com' && (
                <li style={{ marginTop: 20, borderTop: '1px solid #34495e', paddingTop: 20 }} className={activeTab === 'superadmin' ? 'activo' : ''}>
                    <Link 
                        href="/superadmin" 
                        style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', textDecoration: 'none', color: '#f1c40f', fontWeight: 'bold' }}
                    >
                        🕵️‍♂️ Super Admin
                    </Link>
                </li>
            )}
          </ul>
        </nav>

        {activeTab === 'personalizar' && (
          <div className="ajustes-sidebar">
            {/* 1. PLANTILLA */}
            <div className={`card-ajuste ${plantillasAbierto ? 'activo' : ''}`}>
              <div className="ajuste-header" onClick={togglePlantillas}><span className="icono">🎨</span> Plantilla <span className="flecha">▼</span></div>
              <div className={`ajuste-body ${plantillasAbierto ? 'mostrar' : ''}`}>
                 <div className="grid-plantillas">
                  {templates.map((t) => {
                    const isSelected = shopData.template === t.id;
                    const isLockedByPlan = shopData.plan === 'simple' && shopData.templateLocked && shopData.templateLocked !== t.id;
                    
                    return (
                      <div 
                          key={t.id} 
                          className={`item-plantilla ${isSelected ? 'seleccionada' : ''}`} 
                          onClick={() => selectTemplate(t.id)} 
                          style={{
                              opacity: isLockedByPlan ? 0.4 : 1, 
                              filter: isLockedByPlan ? 'grayscale(100%)' : 'none', 
                              cursor: isLockedByPlan ? 'not-allowed' : 'pointer', 
                              border: isSelected && (shopData.plan==='simple' && shopData.templateLocked) ? '2px solid #f1c40f' : ''
                          }}
                          title={isLockedByPlan ? "🔒 Plantilla no disponible en tu Plan Básico actual" : t.label}
                      >
                          <div className="icono-grande">{t.icon}</div>
                          <span style={{textTransform:'capitalize', fontWeight:'bold'}}>
                              {t.label} {isLockedByPlan && '🔒'}
                          </span>
                      </div>
                    );
                  })}
                 </div>
              </div>
            </div>
            
            {/* 2. DATOS */}
            <div className={`card-ajuste ${seccionAbierta === 'datos' ? 'activo' : ''}`}>
              <div className="ajuste-header" onClick={() => toggleAcordeon('datos')}><span className="icono">📝</span> Datos <span className="flecha">▼</span></div>
              <div className={`ajuste-body ${seccionAbierta === 'datos' ? 'mostrar' : ''}`}>
                <label>Nombre</label><input type="text" name="nombreNegocio" value={shopData.nombreNegocio || ''} onChange={handleChange} onClick={checkEdit} />
                <label>Descripción</label><input type="text" name="descripcion" value={shopData.descripcion || ''} onChange={handleChange} onClick={checkEdit} />
                
                {/* WHATSAPP */}
                {shopData.template !== 'personal' && (
                    <>
                      <label>WhatsApp</label>
                      <input type="text" name="whatsapp" value={shopData.whatsapp || ''} onChange={handleChange} onClick={checkEdit} placeholder="Ej: 54911..." />
                    </>
                )}
                
                {/* SELECTOR DE TEMAS PARA 'PERSONAL' */}
                {shopData.template === 'personal' && (
                    <div style={{marginTop:15, borderTop:'1px dashed #34495e', paddingTop:10}}>
                        <label style={{fontSize:11, fontWeight:'bold', color:'#7f8c8d', display:'block', marginBottom:5}}>Estilo de Botones</label>
                        <div style={{display:'flex', gap:5}}>
                            {['minimal', 'neon', 'glass'].map((theme) => (
                                <button 
                                  key={theme}
                                  onClick={() => { if(checkEdit()) updateConfig({ personalTheme: theme }); }}
                                  style={{
                                      flex: 1, padding: '8px', 
                                      background: shopData.personalTheme === theme ? '#3498db' : '#ecf0f1',
                                      color: shopData.personalTheme === theme ? 'white' : '#7f8c8d',
                                      border: 'none', borderRadius: 4, cursor:'pointer', fontSize:11, textTransform:'capitalize'
                                  }}
                                >
                                    {theme}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{marginTop: 10, borderTop:'1px dashed #34495e', paddingTop:10}}>
                    <label style={{fontSize:11, fontWeight:'bold', color:'#7f8c8d', display:'block', marginBottom:5}}>Logo para {shopData.template}</label>
                    <label htmlFor="logo-upload" onClick={(e) => { if(!checkEdit()) e.preventDefault(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', border: '1px dashed #3498db', borderRadius: '6px', cursor: 'pointer', color: '#3498db', fontSize: '11px', background: 'white' }}>
                        {uploading ? '⏳...' : (currentLogo ? '🔄 Cambiar' : '📁 Subir Logo')}
                        <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} style={{display:'none'}} />
                    </label>
                    {currentLogo && <div style={{marginTop:5, display:'flex', alignItems:'center', gap:10, fontSize:10, color:'#27ae60'}}>✅ Cargado <img src={currentLogo} style={{width:20, height:20, borderRadius:'50%', objectFit:'cover'}} /></div>}
                </div>
                <button onClick={handleSaveClick} style={{marginTop:15, width:'100%', padding:8, background:'#2c3e50', color:'white', border:'none', borderRadius:4, cursor:'pointer', fontWeight:'bold'}}>💾 Guardar</button>
              </div>
            </div>

            {/* 3. LINK */}
            <div className={`card-ajuste ${seccionAbierta === 'link' ? 'activo' : ''}`}>
               <div className="ajuste-header" onClick={() => toggleAcordeon('link')}><span className="icono">🔗</span> Link <span className="flecha">▼</span></div>
               <div className={`ajuste-body ${seccionAbierta === 'link' ? 'mostrar' : ''}`}>
                   <label style={{fontSize:11, fontWeight:'bold', color:'#7f8c8d'}}>Tu URL personalizada</label>
                   <div style={{display:'flex', gap:5, marginBottom:10}}>
                       <span style={{padding:'8px', background:'#ecf0f1', color:'#7f8c8d', borderRadius:4, fontSize:12, display:'flex', alignItems:'center'}}>snappy.uno/</span>
                       <input type="text" name="slug" value={shopData.slug || ''} onChange={handleChange} onClick={checkEdit} style={{flex:1, border:'1px solid #bdc3c7', borderRadius:4, padding:5}} placeholder="mi-tienda" />
                   </div>
                   <div style={{display:'flex', gap:5}}>
                       <button onClick={handleSaveClick} style={{flex:1, padding:8, background:'#2c3e50', color:'white', border:'none', borderRadius:4, cursor:'pointer', fontWeight:'bold', fontSize:12}}>💾 Guardar</button>
                       <button onClick={copierLink} style={{padding:'8px 12px', background:'#27ae60', color:'white', border:'none', borderRadius:4, cursor:'pointer'}} title="Copiar Link">📋</button>
                   </div>
               </div>
            </div>

            {/* 4. ITEM RÁPIDO */}
            <div className={`card-ajuste ${seccionAbierta === 'productos' ? 'activo' : ''}`}>
               <div className="ajuste-header" onClick={() => toggleAcordeon('productos')}><span className="icono">{shopData.template === 'personal' ? '🔗' : '📦'}</span> Item Rápido <span className="flecha">▼</span></div>
               <div className={`ajuste-body ${seccionAbierta === 'productos' ? 'mostrar' : ''}`}>
                   
                   <div style={{display:'flex', gap:5, marginBottom:15, marginTop:5, flexWrap:'wrap', alignItems:'center'}}>
                      {itemsRapidos.map((prod: any, i: number) => (
                          <button 
                              key={prod.id} 
                              onClick={() => setIndexEditando(i)} 
                              style={{
                                  padding:'5px', 
                                  background: indexEditando === i ? '#3498db' : '#2c3e50', 
                                  color: indexEditando === i ? 'white' : '#bdc3c7', 
                                  borderRadius:4, border:'none', fontSize:11, width:25, height:25, cursor:'pointer'
                              }}
                          >
                              #{i + 1}
                          </button>
                      ))}
                      {shopData.productos.length < limitItems && (
                          <button onClick={agregarSiguienteProducto} style={{background:'#2ecc71', color:'white', border:'none', borderRadius:4, width:25, height:25, cursor:'pointer', fontWeight:'bold', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center'}} title="Agregar">+</button>
                      )}
                   </div>

                   {productoActivo ? (
                      <div style={{display:'flex', flexDirection:'column', gap:10}}>
                          {shopData.template !== 'personal' ? (
                              <>
                                  <div><label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d'}}>Nombre</label><input type="text" name="titulo" value={productoActivo.titulo} onChange={handleProductEdit} onClick={checkEdit}/></div>
                                  <div><label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d'}}>Descripción</label><input type="text" name="descripcion" value={productoActivo.descripcion} onChange={handleProductEdit} onClick={checkEdit}/></div>
                                  <div><label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d'}}>Precio</label><input type="text" name="precio" value={productoActivo.precio} onChange={handleProductEdit} onClick={checkEdit}/></div>
                                  
                                  <div>
                                      <label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d', display:'block', marginBottom:5}}>Galería (Drag & Drop)</label>
                                      <label htmlFor={`sidebar-upload-${productoActivo.id}`} onClick={(e) => { if(!checkEdit()) e.preventDefault(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', border: '1px dashed #3498db', borderRadius: '6px', cursor: 'pointer', color: '#3498db', fontSize: '11px', fontWeight: '500', backgroundColor: uploading ? '#f0f8ff' : 'white', textAlign: 'center', marginBottom: 10 }}>
                                              {uploading ? '⏳...' : '📸 Agregar Foto'}
                                              <input id={`sidebar-upload-${productoActivo.id}`} type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
                                      </label>

                                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                                              {localGallery.slice(0, 2).map((img: string, idx: number) => (
                                                  <div 
                                                      key={idx}
                                                      draggable
                                                      onDragStart={() => handleDragStart(idx)}
                                                      onDragOver={handleDragOver}
                                                      onDrop={() => handleDrop(idx)}
                                                      style={{position:'relative', width:'100%', aspectRatio:'1/1', border: idx===0 ? '3px solid #2ecc71' : '1px solid #ddd', borderRadius:8, cursor:'grab', overflow:'hidden', background:'white'}}
                                                  >
                                                      <img src={img} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                                      <button onClick={() => { if(checkEdit()) removeImage(idx); }} style={{position:'absolute', top:5, right:5, width:20, height:20, background:'rgba(255,0,0,0.8)', color:'white', borderRadius:'50%', border:'none', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10}}>×</button>
                                                      {idx === 0 && <div style={{position:'absolute', bottom:0, left:0, width:'100%', background:'rgba(46, 204, 113, 0.9)', color:'white', fontSize:9, textAlign:'center', fontWeight:'bold', padding:'3px 0'}}>⭐ PORTADA</div>}
                                                  </div>
                                              ))}
                                      </div>

                                      {localGallery.length > 2 && (
                                          <div style={{marginTop:10, padding:8, background:'#f8f9fa', borderRadius:4, fontSize:10, textAlign:'center', color:'#7f8c8d', border:'1px solid #e9ecef'}}>
                                             Hay <b>{localGallery.length - 2}</b> foto(s) más. <br/>
                                             <Link href="/productos" style={{color:'#3498db', fontWeight:'bold', textDecoration:'none'}}>Ver todas en Productos →</Link>
                                          </div>
                                      )}
                                  </div>
                              </>
                          ) : (
                              <>
                                  <div><label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d'}}>Texto Botón</label><input type="text" name="titulo" value={productoActivo.titulo} onChange={handleProductEdit} onClick={checkEdit}/></div>
                                  <div><label style={{fontSize:10,fontWeight:'bold',color:'#7f8c8d'}}>Link Destino</label><input type="text" name="url" value={productoActivo.url} onChange={handleProductEdit} onClick={checkEdit}/></div>
                              </>
                          )}
                          
                          {/* LINK VER MÁS */}
                          {shopData.template !== 'personal' && <div style={{marginTop:5, textAlign:'center'}}><Link href="/productos" style={{fontSize:11, color:'#3498db', textDecoration:'none'}}>Ver todos los detalles →</Link></div>}
                          
                          {/* BOTÓN DE ELIMINAR */}
                          <button 
                              onClick={handleDeleteItem} 
                              style={{
                                  marginTop:10, width:'100%', padding:'8px', 
                                  background:'#fee2e2', color:'#ef4444', 
                                  border:'1px solid #fca5a5', borderRadius:6, 
                                  cursor:'pointer', fontSize:'11px', fontWeight:'bold'
                              }}
                          >
                              🗑️ Eliminar Ítem
                          </button>

                      </div>
                   ) : <span style={{fontSize:12, color:'#95a5a6'}}>Agrega un ítem para editar.</span>}
               </div>
            </div>
          </div>
        )}
        
        {/* FOOTER PEGADO AL FINAL */}
        <div style={{marginTop:'auto', width:'100%', borderTop:'1px solid #34495e', paddingTop: 20}}>
             <div className="producto" style={{marginBottom:10}}><button><a href={`${DOMAIN_URL}/${shopData.slug}`} target="_blank" style={{color:'white', textDecoration:'none'}}>Ver {shopData.template} →</a></button></div>
             <div className="cerrar-sesion"><button onClick={handleLogout} style={{color:'#ffffffff', textAlign: 'center', width:'100%', background:'transparent', border:'none', cursor:'pointer'}}>Salir</button></div>
        </div>
        
      </aside>
    </>
  );
}