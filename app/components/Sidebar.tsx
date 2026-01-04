'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useShop, Product } from '../context/ShopContext';

interface SidebarProps {
  activeTab?: 'personalizar' | 'productos';
  previewItem?: any; 
  setPreviewItem?: any;
}

export default function Sidebar({ activeTab = 'personalizar' }: SidebarProps) {
  const { shopData, updateConfig, updateProduct, addProduct, changeTemplate } = useShop();
  
  // 1. ESTADO INDEPENDIENTE PARA PLANTILLAS
  // True por defecto (abierto), pero se puede cerrar.
  const [plantillasAbierto, setPlantillasAbierto] = useState(true);

  // 2. ESTADO ACORDEÓN PARA EL RESTO (Datos, Link, Productos)
  // Null por defecto (todos cerrados al inicio).
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(null);
  
  const [indexEditando, setIndexEditando] = useState(0); 

  // Producto activo para editar (seguro)
  const productoActivo = shopData.productos[indexEditando] || shopData.productos[0];

  // Toggle solo para plantillas (no afecta a los demás)
  const togglePlantillas = () => {
    setPlantillasAbierto(!plantillasAbierto);
  };

  // Toggle para el resto (si abro uno, cierro los otros de este grupo)
  const toggleAcordeon = (seccion: string) => {
    setSeccionAbierta(seccionAbierta === seccion ? null : seccion);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    updateConfig({ [name]: value });
  };

  const handleProductEdit = (e: any) => {
    if (!productoActivo) return;
    const { name, value } = e.target;
    updateProduct(productoActivo.id, { [name]: value });
  };

  const selectTemplate = (val: string) => {
    changeTemplate(val);
    setIndexEditando(0);
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(`http://localhost:3000/${shopData.slug}`);
    alert('Link copiado');
  };

  const agregarSiguienteProducto = () => {
    const nuevoId = Date.now().toString();
    const nuevoProd: Product = {
        id: nuevoId,
        titulo: shopData.template === 'personal' ? 'Nuevo Enlace' : 'Nuevo Producto',
        descripcion: '',
        precio: '',
        imagen: '',
        url: '#'
    };
    addProduct(nuevoProd);
    setIndexEditando(shopData.productos.length);
  };

  // Bloqueo de navegación si es plantilla personal
  const handleProductosClick = (e: React.MouseEvent) => {
    if (shopData.template === 'personal') {
        e.preventDefault(); 
        alert("🔒 La sección 'Productos' no está disponible en la plantilla Personal porque solo utilizas enlaces.");
    }
  };

  return (
    <aside className="sidebar">
      <h1>Hola {shopData.nombreAdmin}</h1>
      <h2>Panel de control</h2>

      <nav style={{ marginBottom: '20px' }}>
        <ul>
          <li className={activeTab === 'personalizar' ? 'activo' : ''}>
            <Link 
                href="/admin" 
                style={{
                    display: 'flex', alignItems: 'center', width: '100%', height: '100%', 
                    textDecoration: 'none', color: 'inherit'
                }}
            >
                Personalizar
            </Link>
          </li>
          
          <li className={activeTab === 'productos' ? 'activo' : ''} style={{opacity: shopData.template === 'personal' ? 0.5 : 1}}>
            <Link 
                href="/productos" 
                onClick={handleProductosClick} 
                style={{
                    display: 'flex', alignItems: 'center', width: '100%', height: '100%', 
                    textDecoration: 'none', color: 'inherit',
                    cursor: shopData.template === 'personal' ? 'not-allowed' : 'pointer'
                }}
            >
                {shopData.template === 'personal' ? '🔒 Productos' : 'Productos'}
            </Link>
          </li>
        </ul>
      </nav>

      {/* --- CONTENIDO DEL SIDEBAR SEGÚN PESTAÑA --- */}

      {activeTab === 'personalizar' && (
        <div className="ajustes-sidebar">

          {/* 1. PLANTILLA (INDEPENDIENTE) */}
          <div className={`card-ajuste ${plantillasAbierto ? 'activo' : ''}`}>
            <div className="ajuste-header" onClick={togglePlantillas}>
              <span className="icono">🎨</span> Plantilla <span className="flecha">▼</span>
            </div>
            <div className={`ajuste-body ${plantillasAbierto ? 'mostrar' : ''}`}>
               <div className="grid-plantillas">
                {['tienda', 'catalogo', 'menu', 'personal'].map((t) => (
                  <div key={t} className={`item-plantilla ${shopData.template === t ? 'seleccionada' : ''}`} onClick={(e) => { e.stopPropagation(); selectTemplate(t); }}>
                    <div className="icono-grande">{t === 'tienda' ? '🛒' : t === 'catalogo' ? '📖' : t === 'menu' ? '🍔' : '👤'}</div>
                    <span style={{textTransform:'capitalize'}}>{t}</span>
                  </div>
                ))}
               </div>
            </div>
          </div>

          {/* 2. DATOS (GRUPO ACORDEÓN) */}
          <div className={`card-ajuste ${seccionAbierta === 'datos' ? 'activo' : ''}`}>
            <div className="ajuste-header" onClick={() => toggleAcordeon('datos')}>
              <span className="icono">📝</span> Datos Básicos <span className="flecha">▼</span>
            </div>
            <div className={`ajuste-body ${seccionAbierta === 'datos' ? 'mostrar' : ''}`}>
              <label>Nombre</label><input type="text" name="nombreNegocio" value={shopData.nombreNegocio} onChange={handleChange} />
              <label>Descripción</label><input type="text" name="descripcion" value={shopData.descripcion} onChange={handleChange} />
              <label>WhatsApp</label><input type="text" name="whatsapp" value={shopData.whatsapp} onChange={handleChange} />
              <p style={{fontSize:'11px', color:'#f1c40f', marginTop:'4px', fontStyle:'italic'}}>* A este número se enviarán los pedidos.</p>
              <label>Logo (URL)</label><div className="area-upload"><input type="text" name="logo" placeholder="URL imagen" value={shopData.logo} onChange={handleChange} /></div>
              
              {shopData.template !== 'personal' && (
                  <>
                    <label>Estilo Visual</label>
                    <select name="plantillaVisual" value={shopData.plantillaVisual} onChange={handleChange}>
                        <option value="Minimal">Minimal</option><option value="Moderna">Dark Mode</option>
                    </select>
                  </>
              )}
            </div>
          </div>

          {/* 3. LINK PÚBLICO (GRUPO ACORDEÓN) */}
          <div className={`card-ajuste ${seccionAbierta === 'link' ? 'activo' : ''}`}>
            <div className="ajuste-header" onClick={() => toggleAcordeon('link')}>
              <span className="icono">🔗</span> Link público <span className="flecha">▼</span>
            </div>
            <div className={`ajuste-body ${seccionAbierta === 'link' ? 'mostrar' : ''}`}>
               <div className="grupo-link">
                  <span className="dominio-fijo">http://localhost:3000/</span>
                  <input type="text" name="slug" value={shopData.slug} onChange={handleChange} style={{fontWeight:'bold', color:'#3498db'}}/>
               </div>
               <button className="btn-copiar" onClick={copiarLink}>Copiar Link</button>
            </div>
          </div>

          {/* 4. MIS ENLACES / PRODUCTOS (GRUPO ACORDEÓN) */}
          <div className={`card-ajuste ${seccionAbierta === 'productos' ? 'activo' : ''}`}>
            <div className="ajuste-header" onClick={() => toggleAcordeon('productos')}>
              <span className="icono">{shopData.template === 'personal' ? '🔗' : '📦'}</span> 
              {shopData.template === 'personal' ? 'Mis Enlaces' : 'Mis Productos'}
              <span className="flecha">▼</span>
            </div>
            <div className={`ajuste-body ${seccionAbierta === 'productos' ? 'mostrar' : ''}`}>
               
               <div style={{display:'flex', gap:5, marginTop:15, marginBottom:15, flexWrap:'wrap'}}>
                  {shopData.productos.map((_:any, idx:number) => (
                      <button 
                        key={idx}
                        onClick={() => setIndexEditando(idx)}
                        style={{
                            padding:'5px 10px', borderRadius:5, border:'none', cursor:'pointer', fontSize:12,
                            background: indexEditando === idx ? '#3498db' : '#2c3e50',
                            color: indexEditando === idx ? 'white' : '#bdc3c7',
                        }}>
                        #{idx + 1}
                      </button>
                  ))}
                  {shopData.productos.length < 4 && (
                      <button onClick={agregarSiguienteProducto} style={{padding:'5px 10px', borderRadius:5, border:'1px dashed #7f8c8d', background:'transparent', color:'#bdc3c7', cursor:'pointer'}}>+</button>
                  )}
               </div>

               {productoActivo ? (
                   <>
                       {shopData.template !== 'personal' ? (
                         <>
                          <label>Imagen (URL)</label><div className="area-upload"><input type="text" name="imagen" value={productoActivo.imagen || ''} onChange={handleProductEdit} /></div>
                          <label>Título</label><input type="text" name="titulo" value={productoActivo.titulo || ''} onChange={handleProductEdit} />
                          <label>Descripción</label><input type="text" name="descripcion" value={productoActivo.descripcion || ''} onChange={handleProductEdit} />
                          <label>Precio</label><input type="text" name="precio" placeholder="$" value={productoActivo.precio || ''} onChange={handleProductEdit} />
                         </>
                       ) : (
                         <>
                          <label>Texto Botón</label><input type="text" name="titulo" value={productoActivo.titulo || ''} onChange={handleProductEdit} />
                          <label>Destino (URL)</label><input type="text" name="url" value={productoActivo.url || ''} onChange={handleProductEdit} />
                         </>
                       )}
                   </>
               ) : <p>Carga un ítem.</p>}

               {shopData.template === 'personal' ? (
                   <div style={{marginTop:20, borderTop:'1px solid #465f76', paddingTop:15}}>
                       <label style={{marginBottom:10}}>Estilo de los botones:</label>
                       <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                           <button onClick={() => updateConfig({personalTheme: 'glass'})} style={{background: 'linear-gradient(45deg, #667eea, #764ba2)', color:'white', padding:8, borderRadius:5, fontSize:11, cursor:'pointer', border: shopData.personalTheme === 'glass' ? '2px solid white' : 'none'}}>Glass</button>
                           <button onClick={() => updateConfig({personalTheme: 'minimal'})} style={{background: '#ecf0f1', color:'#333', padding:8, borderRadius:5, fontSize:11, cursor:'pointer', border: shopData.personalTheme === 'minimal' ? '2px solid #3498db' : '1px solid #bdc3c7'}}>Minimal</button>
                           <button onClick={() => updateConfig({personalTheme: 'neon'})} style={{background: '#000', color:'#0f0', padding:8, borderRadius:5, fontSize:11, cursor:'pointer', border: shopData.personalTheme === 'neon' ? '2px solid white' : '1px solid #0f0'}}>Neon</button>
                           <button onClick={() => updateConfig({personalTheme: 'flat'})} style={{background: '#e74c3c', color:'white', padding:8, borderRadius:5, fontSize:11, cursor:'pointer', border: shopData.personalTheme === 'flat' ? '2px solid white' : 'none'}}>Flat</button>
                       </div>
                   </div>
               ) : (
                   <div style={{marginTop:20, textAlign:'center', borderTop:'1px solid #465f76', paddingTop:15}}>
                       <Link href="/productos" style={{textDecoration:'none'}}>
                          <button className="btn-agregar-grande">Ir a Gestión de Productos →</button>
                       </Link>
                   </div>
               )}

            </div>
          </div>

        </div>
      )}

      {/* Solo Link en productos (Visualización de URL) */}
      {activeTab === 'productos' && (
        <div className="ajustes-sidebar">
            <div className="card-ajuste activo" style={{display:'block'}}>
                <div className="ajuste-header" style={{cursor: 'default', background: '#34495e'}}>
                    <span className="icono">🔗</span> Link público
                </div>
                <div className="ajuste-body" style={{display:'block', borderTop: 'none'}}>
                    <div className="grupo-link">
                        <span className="dominio-fijo">http://localhost:3000/</span>
                        <input type="text" readOnly value={shopData.slug} style={{fontWeight:'bold', color:'#3498db', cursor:'default'}}/>
                    </div>
                    <button className="btn-copiar" onClick={copiarLink}>Copiar Link</button>
                </div>
            </div>
        </div>
      )}

      <hr />
      <div className="producto">
         <button><a href={`/${shopData.slug}`} target="_blank">Mi Link: /{shopData.slug}</a></button>
      </div>
      <div className="cerrar-sesion">
        <button><Link href="/" style={{color:'white', textDecoration:'none', width:'100%', height:'100%', display:'block'}}>Cerrar Sesion</Link></button>
      </div>
    </aside>
  );
}