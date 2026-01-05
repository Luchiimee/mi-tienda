'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useShop, Product } from '../context/ShopContext';
import { supabase } from '@/lib/supabaseClient'; 
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeTab?: 'personalizar' | 'productos' | 'configuracion'; // Agregamos 'configuracion'
}

export default function Sidebar({ activeTab = 'personalizar' }: SidebarProps) {
  const { shopData, updateConfig, updateProduct, addProduct, changeTemplate, canEdit } = useShop();
  const router = useRouter();

  // Estados de los acordeones
  const [plantillasAbierto, setPlantillasAbierto] = useState(true);
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(null);
  
  // Estado para edición rápida de productos en sidebar
  const [indexEditando, setIndexEditando] = useState(0); 
  const productoActivo = shopData.productos[indexEditando] || shopData.productos[0];

  const togglePlantillas = () => setPlantillasAbierto(!plantillasAbierto);
  const toggleAcordeon = (seccion: string) => setSeccionAbierta(seccionAbierta === seccion ? null : seccion);

  // --- VALIDACIÓN ANTES DE EDITAR ---
  const checkEdit = () => {
      if (!canEdit()) {
          const ir = window.confirm("⚠️ Para editar, primero debes confirmar tu Plan y Plantilla en Configuración.\n\n¿Ir a Configuración ahora?");
          if (ir) router.push('/configuracion');
          return false;
      }
      return true;
  };

  const handleChange = (e: any) => {
    if (!checkEdit()) return;
    const { name, value } = e.target;
    updateConfig({ [name]: value });
  };

  const handleProductEdit = (e: any) => {
    if (!checkEdit()) return;
    if (!productoActivo) return;
    const { name, value } = e.target;
    updateProduct(productoActivo.id, { [name]: value });
  };

  const selectTemplate = (val: string) => {
    // Aquí sí dejamos cambiar para que "Pruebe" en el Mockup. 
    // El bloqueo real de guardar en DB lo maneja el Contexto o el botón de Guardar en Config.
    changeTemplate(val);
    setIndexEditando(0);
  };

  const copiarLink = () => {
    const url = `${window.location.origin}/${shopData.slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado: ' + url);
  };

  const agregarSiguienteProducto = () => {
    if (!checkEdit()) return;
    const nuevoId = Date.now().toString();
    const nuevoProd: Product = {
        id: nuevoId,
        titulo: shopData.template === 'personal' ? 'Nuevo Enlace' : 'Nuevo Item',
        descripcion: '', precio: '', imagen: '', url: '#'
    };
    addProduct(nuevoProd);
    setIndexEditando(shopData.productos.length);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="sidebar">
      <div style={{marginBottom: 20}}>
        <h1 style={{fontSize:18, margin:0}}>Hola {shopData.nombreAdmin}</h1>
        <span style={{fontSize:12, color:'#95a5a6'}}>Panel de control</span>
      </div>

      {/* --- MENÚ DE NAVEGACIÓN --- */}
      <nav style={{ marginBottom: '20px' }}>
        <ul>
          <li className={activeTab === 'personalizar' ? 'activo' : ''}>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>
                🖌️ Personalizar
            </Link>
          </li>
          
          <li className={activeTab === 'productos' ? 'activo' : ''} style={{opacity: shopData.template === 'personal' ? 0.5 : 1}}>
            <Link href="/productos" onClick={(e) => shopData.template === 'personal' && e.preventDefault()} style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit', cursor: shopData.template === 'personal' ? 'not-allowed' : 'pointer' }}>
                📦 Productos
            </Link>
          </li>

          <li className={activeTab === 'configuracion' ? 'activo' : ''}>
            <Link href="/configuracion" style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>
                ⚙️ Configuración
            </Link>
          </li>
        </ul>
      </nav>

      {/* --- CONTENIDO SIDEBAR (SOLO EN PERSONALIZAR) --- */}
      {activeTab === 'personalizar' && (
        <div className="ajustes-sidebar">

          {/* 1. PLANTILLA (TOGGLE CLÁSICO) */}
          <div className={`card-ajuste ${plantillasAbierto ? 'activo' : ''}`}>
            <div className="ajuste-header" onClick={togglePlantillas}>
              <span className="icono">🎨</span> Plantilla <span className="flecha">▼</span>
            </div>
            <div className={`ajuste-body ${plantillasAbierto ? 'mostrar' : ''}`}>
               <div className="grid-plantillas">
                {['tienda', 'catalogo', 'menu', 'personal'].map((t) => (
                  <div key={t} className={`item-plantilla ${shopData.template === t ? 'seleccionada' : ''}`} onClick={() => selectTemplate(t)}>
                    <div className="icono-grande">{t === 'tienda' ? '🛒' : t === 'catalogo' ? '📖' : t === 'menu' ? '🍔' : '👤'}</div>
                    <span style={{textTransform:'capitalize'}}>{t}</span>
                  </div>
                ))}
               </div>
               <p style={{fontSize:10, color:'#7f8c8d', marginTop:5, textAlign:'center'}}>
                   {shopData.plan === 'simple' && shopData.templateLocked 
                    ? `Bloqueado en: ${shopData.templateLocked.toUpperCase()}` 
                    : 'Prueba las plantillas. Ve a Configuración para confirmar.'}
               </p>
            </div>
          </div>

          {/* 2. DATOS BÁSICOS */}
          <div className={`card-ajuste ${seccionAbierta === 'datos' ? 'activo' : ''}`}>
            <div className="ajuste-header" onClick={() => toggleAcordeon('datos')}>
              <span className="icono">📝</span> Datos Básicos <span className="flecha">▼</span>
            </div>
            <div className={`ajuste-body ${seccionAbierta === 'datos' ? 'mostrar' : ''}`}>
              <label>Nombre Negocio</label><input type="text" name="nombreNegocio" value={shopData.nombreNegocio} onChange={handleChange} />
              <label>Descripción</label><input type="text" name="descripcion" value={shopData.descripcion} onChange={handleChange} />
              <label>WhatsApp</label><input type="text" name="whatsapp" value={shopData.whatsapp} onChange={handleChange} />
              <div className="area-upload"><input type="text" name="logo" placeholder="URL Logo" value={shopData.logo} onChange={handleChange} /></div>
              {shopData.template !== 'personal' && (
                  <select name="plantillaVisual" value={shopData.plantillaVisual} onChange={handleChange} style={{marginTop:10}}>
                      <option value="Minimal">Modo Claro</option><option value="Moderna">Modo Oscuro</option>
                  </select>
              )}
            </div>
          </div>

          {/* 3. LINK PÚBLICO */}
          <div className={`card-ajuste ${seccionAbierta === 'link' ? 'activo' : ''}`}>
            <div className="ajuste-header" onClick={() => toggleAcordeon('link')}>
              <span className="icono">🔗</span> Link público <span className="flecha">▼</span>
            </div>
            <div className={`ajuste-body ${seccionAbierta === 'link' ? 'mostrar' : ''}`}>
               <div className="grupo-link">
                  <span className="dominio-fijo">/</span>
                  <input type="text" name="slug" value={shopData.slug} onChange={handleChange} style={{fontWeight:'bold', color:'#3498db'}}/>
               </div>
               <button className="btn-copiar" onClick={copiarLink}>Copiar Link</button>
            </div>
          </div>

          {/* 4. EDICIÓN RÁPIDA (MIS PRODUCTOS) */}
          <div className={`card-ajuste ${seccionAbierta === 'productos' ? 'activo' : ''}`}>
            <div className="ajuste-header" onClick={() => toggleAcordeon('productos')}>
              <span className="icono">{shopData.template === 'personal' ? '🔗' : '📦'}</span> 
              {shopData.template === 'personal' ? 'Mis Enlaces' : 'Item Rápido'} <span className="flecha">▼</span>
            </div>
            <div className={`ajuste-body ${seccionAbierta === 'productos' ? 'mostrar' : ''}`}>
                <div style={{display:'flex', gap:5, marginBottom:10, flexWrap:'wrap'}}>
                    {shopData.productos.slice(0, 4).map((_:any, idx:number) => (
                        <button key={idx} onClick={() => setIndexEditando(idx)} style={{padding:'5px', background: indexEditando === idx ? '#3498db' : '#2c3e50', color: indexEditando === idx ? 'white' : '#bdc3c7', border:'none', borderRadius:4, cursor:'pointer', fontSize:11}}>#{idx+1}</button>
                    ))}
                    <button onClick={agregarSiguienteProducto} style={{padding:'5px', background:'transparent', border:'1px dashed #95a5a6', color:'#95a5a6', borderRadius:4, cursor:'pointer'}}>+</button>
                </div>
                
                {productoActivo ? (
                    <>
                        <input type="text" name="titulo" placeholder="Título" value={productoActivo.titulo || ''} onChange={handleProductEdit} />
                        {shopData.template !== 'personal' && <input type="text" name="precio" placeholder="$ Precio" value={productoActivo.precio || ''} onChange={handleProductEdit} />}
                        <div style={{marginTop:10, textAlign:'center'}}>
                            <Link href="/productos" style={{fontSize:12, color:'#3498db', textDecoration:'none'}}>Ir a sección completa →</Link>
                        </div>
                    </>
                ) : <span style={{fontSize:12}}>Carga un ítem (+)</span>}
            </div>
          </div>

        </div>
      )}

      <hr style={{margin:'20px 0', borderColor:'#34495e'}}/>
      <div className="producto"><button><a href={`/${shopData.slug}`} target="_blank">Ver mi Link →</a></button></div>
      <div className="cerrar-sesion"><button onClick={handleLogout} style={{background:'#e74c3c'}}>Cerrar Sesión</button></div>
    </aside>
  );
}