'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PublicShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState<{[key: string]: number}>({});
  const [busqueda, setBusqueda] = useState('');
  
  // --- ESTADO PARA LA GALERÍA (LIGHTBOX) ---
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);

  const getTipo = (tmpl: string) => {
      if (tmpl === 'menu') return 'gastronomia';
      if (tmpl === 'personal') return 'enlace';
      if (tmpl === 'catalogo') return 'catalogo';
      return 'producto';
  };

  useEffect(() => {
    const fetchShopData = async () => {
      const { data: shops, error } = await supabase.from('shops').select('*').or(`slug_tienda.eq.${slug},slug_catalogo.eq.${slug},slug_menu.eq.${slug},slug_personal.eq.${slug},slug.eq.${slug}`);
      if (error || !shops || shops.length === 0) { setLoading(false); return; }
      
      const shopData = shops[0];
      let detectedTemplate = shopData.template;
      if (shopData.slug_menu === slug) detectedTemplate = 'menu';
      else if (shopData.slug_tienda === slug) detectedTemplate = 'tienda';
      else if (shopData.slug_catalogo === slug) detectedTemplate = 'catalogo';
      else if (shopData.slug_personal === slug) detectedTemplate = 'personal';
      
      shopData.template = detectedTemplate; 
      setShop(shopData);
      
      const tipoNecesario = getTipo(detectedTemplate);
      const { data: prodData } = await supabase.from('products').select('*').eq('shop_id', shopData.id).eq('tipo', tipoNecesario).order('created_at', { ascending: true });
      if (prodData) setProducts(prodData);
      setLoading(false);
    };
    fetchShopData();
  }, [slug]);

  const agregar = (id: string) => setCarrito(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const remover = (id: string) => {
    setCarrito(prev => {
        const cant = prev[id] || 0;
        if (cant <= 1) { const n = {...prev}; delete n[id]; return n; }
        return { ...prev, [id]: cant - 1 };
    });
  };
  
  const total = products.reduce((acc, p) => acc + (parseFloat(p.precio) || 0) * (carrito[p.id] || 0), 0);
  const cantidadTotal = Object.values(carrito).reduce((a, b) => a + b, 0);

  const handleWhatsApp = () => {
    if(!shop) return;
    if (cantidadTotal === 0) { alert("⚠️ Selecciona al menos un ítem."); return; }
    let mensaje = `Hola *${shop.nombre_negocio}*, me interesa:%0A`;
    products.forEach(p => { 
        if(carrito[p.id] > 0) {
             const precioStr = (shop.template === 'catalogo' && (!p.precio || p.precio === '0')) ? '' : ` ($${p.precio})`;
             mensaje += `- ${carrito[p.id]}x ${p.titulo}${precioStr}%0A`; 
        }
    });
    if (shop.template !== 'catalogo' || total > 0) mensaje += `%0ATotal estimado: $${total}`;
    window.open(`https://wa.me/${shop.whatsapp}?text=${mensaje}`, '_blank');
  };

  // --- ABRIR GALERÍA (SOLO TIENDA Y CATALOGO) ---
  const openGallery = (p: any) => {
      if (shop.template === 'tienda' || shop.template === 'catalogo') {
          setViewingProduct(p);
      }
  };

  const productosFiltrados = products.filter(p => p.titulo.toLowerCase().includes(busqueda.toLowerCase()));

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>⚡ Cargando...</div>;
  if (!shop) return <div style={{textAlign:'center', padding:50}}><h1>404</h1><p>No existe tienda con este link.</p></div>;

  const isDark = shop.plantilla_visual === 'Moderna';
  const bgBody = isDark ? '#111' : '#f0f2f5';
  const bgApp = isDark ? '#1a1a1a' : '#f8f8f8';
  const text = isDark ? '#ffffff' : '#333333';
  const cardBg = isDark ? '#333' : 'rgb(248, 248, 248)'; 
  const accentColor = isDark ? '#5dade2' : '#3498db';
  const isGrid = shop.template === 'tienda' || shop.template === 'catalogo' || shop.template === 'menu';

  const getPersonalStyle = (theme: string) => {
    const base = { display:'block', padding: '16px', borderRadius: '50px', fontWeight: 'bold', fontSize: '15px', textAlign: 'center' as const, marginBottom: '0px', textDecoration: 'none', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.1s ease', color: 'white', background: accentColor };
    if (theme === 'neon') return { ...base, background: '#000', color: '#0f0', border: '2px solid #0f0', boxShadow: '0 0 15px #0f0' };
    if (theme === 'minimal') return { ...base, background: 'transparent', color: text, border: `2px solid ${text}`, boxShadow:'none' };
    if (theme === 'glass') return { ...base, background: isDark?'rgba(255,255,255,0.15)':'rgba(52, 152, 219, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', color: text };
    return base;
  };

  return (
    <div style={{ minHeight: '100vh', background: bgBody, fontFamily: 'sans-serif', display:'flex', justifyContent:'center' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: bgApp, minHeight: '100vh', boxShadow: '0 0 20px rgba(0,0,0,0.05)', position: 'relative', paddingBottom: 100 }}>
          
          {/* HEADER */}
          <div style={{ padding: '40px 20px 20px 20px', textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff', margin: '0 auto 10px', overflow:'hidden', border: '2px solid #ff9f43', padding: 2 }}>
                  <div style={{width:'100%', height:'100%', borderRadius:'50%', overflow:'hidden'}}>
                     {shop.logo_url ? <img src={shop.logo_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <span style={{fontSize:40, lineHeight:'70px'}}>😎</span>}
                  </div>
              </div>
              <h1 style={{ margin: 0, fontSize: 22, color: text, fontWeight: 'bold' }}>{shop.nombre_negocio}</h1>
              <p style={{ margin: '5px 0 0', fontSize: 13, color: '#888', lineHeight: 1.3 }}>{shop.descripcion}</p>
          </div>

          {/* BUSCADOR */}
          {shop.template !== 'personal' && (
            <div style={{ padding: '0 20px', marginBottom: 25 }}>
                <div style={{ padding: '5px 5px 5px 20px', borderRadius: 50, fontSize: 14, backgroundColor: isDark ? '#333' : '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{border:'none', background:'transparent', outline:'none', color:'inherit', width:'100%', fontSize:14}} />
                    <div style={{width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>🔍</div>
                </div>
            </div>
          )}

          {/* LISTA DE PRODUCTOS */}
          <div style={{ padding: '0 20px', display: isGrid ? 'grid' : 'flex', gridTemplateColumns: isGrid ? '1fr 1fr' : 'none', flexDirection: isGrid ? 'row' : 'column', gap: 15, rowGap: shop.template === 'menu' ? 60 : 15, marginTop: 30, paddingBottom: 160 }}>
              
              {shop.template === 'personal' && productosFiltrados.map((p) => (
                 <a key={p.id} href={p.url_destino || '#'} target="_blank" style={getPersonalStyle(shop.personal_theme)}>{p.titulo}</a>
              ))}

              {(shop.template === 'tienda' || shop.template === 'catalogo') && productosFiltrados.map((p) => {
                  const qty = carrito[p.id] || 0;
                  const isCatalogo = shop.template === 'catalogo';
                  const precioVacio = !p.precio || p.precio === '0';
                  // Imagen principal
                  const imgUrl = (p.galeria && p.galeria.length > 0) ? p.galeria[0] : p.imagen_url;

                  return (
                      <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', backgroundColor: cardBg, boxShadow: '1px 1px 3px 1px #9d9d9d5e', width: '100%', gap: 10, borderRadius: 12, overflow: 'hidden' }}>
                          <div 
                            style={{ width: '100%', height: 250, background: 'white', cursor: 'pointer' }}
                            onClick={() => openGallery(p)} // ABRIR GALERIA AL CLICK
                          >
                               {imgUrl ? (
                                   <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                               ) : (
                                   <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, color:'#ccc'}}>📷</div>
                               )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 10px 15px 10px', width: '100%', textAlign: 'left' }}>
                              <div style={{ fontWeight: 'bold', fontSize: 15, color: text, marginBottom: 2 }}>{p.titulo}</div>
                              <div style={{ fontSize: 11, color: '#888', marginBottom: 6, lineHeight: 1.3 }}>{p.descripcion}</div>
                              <div style={{ fontWeight: 'bold', fontSize: 16, color: '#27ae60', marginBottom: 10 }}>
                                  {(isCatalogo && precioVacio) ? 'Consultar' : `$${p.precio}`}
                              </div>
                              {qty === 0 ? (
                                  <button onClick={() => agregar(p.id)} style={{ width:'100%', padding:'10px', borderRadius: 8, background: isDark?'#444':'#e0e0e0', color: isDark?'#fff':'#333', border:'none', fontSize:13, fontWeight:'bold', cursor:'pointer' }}>
                                      {isCatalogo ? 'Seleccionar' : 'Agregar'}
                                  </button>
                              ) : (
                                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', background: isDark?'#222':'#f0f0f0', borderRadius:8, padding:'5px' }}>
                                      <button onClick={()=>remover(p.id)} style={{width:30, height:30, borderRadius:6, background:'white', border:'1px solid #ccc', fontWeight:'bold', cursor:'pointer'}}>-</button>
                                      <span style={{fontWeight:'bold'}}>{qty}</span>
                                      <button onClick={()=>agregar(p.id)} style={{width:30, height:30, borderRadius:6, background:accentColor, color:'white', border:'none', fontWeight:'bold', cursor:'pointer'}}>+</button>
                                  </div>
                              )}
                          </div>
                      </div>
                  );
              })}

              {shop.template === 'menu' && productosFiltrados.map((p) => {
                  const qty = carrito[p.id] || 0;
                  // Imagen principal
                  const imgUrl = (p.galeria && p.galeria.length > 0) ? p.galeria[0] : p.imagen_url;

                  return (
                      <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: cardBg, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: '0 15px 15px 15px', borderRadius: 12, marginTop: 60, overflow: 'visible', position: 'relative', width: '100%' }}>
                          <div style={{ position: 'relative', marginTop: -50, width: '90%', maxWidth: 140, aspectRatio: '1/1', borderRadius: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', backgroundColor: 'white', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {imgUrl ? <img src={imgUrl} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div style={{fontSize:40}}>🍔</div>}
                          </div>
                          <div style={{textAlign:'center', width: '100%', marginTop: 10}}>
                              <div style={{ fontWeight: 'bold', color: text, fontSize:15, marginBottom: 2 }}>{p.titulo}</div>
                              <div style={{ fontSize: 11, color: '#999', marginBottom: 5 }}>{p.descripcion}</div>
                              <div style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 16 }}>${p.precio}</div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap: 15, marginTop: 5 }}>
                              <button onClick={()=>remover(p.id)} style={{width:32, height:32, borderRadius:'50%', border:'1px solid #ddd', background:'white', color:'#e74c3c', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>-</button>
                              <span style={{fontWeight:'bold', fontSize:16, minWidth:10}}>{qty}</span>
                              <button onClick={()=>agregar(p.id)} style={{width:32, height:32, borderRadius:'50%', border:'1px solid #ddd', background:'white', color:'#27ae60', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>+</button>
                          </div>
                      </div>
                  );
              })}
          </div>

          {/* FOOTER (CARRITO) */}
          {(shop.template !== 'personal') && (
            <div style={{ position:'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', padding: '15px 20px', background: isDark ? '#222' : 'white', borderTop: isDark ? '1px solid #444' : '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, boxShadow: '0 -5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{fontSize:'12px', color:'#888'}}>
                    {shop.template === 'catalogo' ? 'Seleccionados:' : 'Total:'} 
                    <span style={{color: text, fontWeight:'bold', fontSize:'15px', marginLeft: 5}}>
                         {shop.template === 'catalogo' ? cantidadTotal : `$${total}`}
                    </span>
                </div>
                <button onClick={handleWhatsApp} style={{ background: '#25D366', color:'white', border:'none', padding:'10px 20px', borderRadius:'20px', fontWeight:'bold', fontSize:'13px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)'}}>
                    {shop.template === 'catalogo' ? 'Consultar' : 'Pedir WhatsApp'}
                </button>
            </div>
          )}
          
          <div style={{textAlign:'center', marginTop: 30, paddingBottom: 100, fontSize:11, color:'#aaa'}}>Potenciado por <b>Snappy ⚡</b></div>

          {/* --- MODAL GALERÍA / LIGHTBOX --- */}
          {viewingProduct && (
              <div style={{
                  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                  background: 'rgba(0,0,0,0.95)', zIndex: 9999, 
                  display: 'flex', flexDirection: 'column', justifyContent: 'center'
              }}>
                  {/* Botón cerrar */}
                  <button 
                    onClick={() => setViewingProduct(null)}
                    style={{position:'absolute', top: 20, right: 20, background:'rgba(255,255,255,0.2)', color:'white', border:'none', fontSize:20, borderRadius:'50%', width:40, height:40, cursor:'pointer', zIndex:10000}}
                  >✕</button>

                  <div style={{
                      display: 'flex', 
                      overflowX: 'auto', 
                      scrollSnapType: 'x mandatory', 
                      height: '80%', 
                      alignItems: 'center',
                      gap: 20,
                      padding: '0 20px'
                  }}>
                      {/* Renderizar todas las fotos de la galería (o la principal si no hay galería) */}
                      {(() => {
                          const images = (viewingProduct.galeria && viewingProduct.galeria.length > 0) 
                                         ? viewingProduct.galeria 
                                         : (viewingProduct.imagen_url ? [viewingProduct.imagen_url] : []);
                          
                          if (images.length === 0) return <div style={{color:'white', width:'100%', textAlign:'center'}}>Sin imágenes</div>;

                          return images.map((img: string, idx: number) => (
                              <div key={idx} style={{
                                  flex: '0 0 100%', 
                                  height: '100%', 
                                  scrollSnapAlign: 'center',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                              }}>
                                  <img src={img} style={{maxHeight:'100%', maxWidth:'100%', objectFit:'contain', borderRadius:10}} />
                              </div>
                          ));
                      })()}
                  </div>
                  
                  {/* Indicador de Swipe */}
                  <div style={{textAlign:'center', color:'rgba(255,255,255,0.5)', marginTop:20, fontSize:12}}>
                      {(viewingProduct.galeria && viewingProduct.galeria.length > 1) ? 'Desliza para ver más →' : viewingProduct.titulo}
                  </div>
              </div>
          )}

      </div>
    </div>
  );
}