'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';

export default function PublicShopPage() {
  const params = useParams();
  const slug = params?.slug as string; 

  // --- ESTADOS ---
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState(''); // Agregamos buscador funcional
  
  // Estado para la plantilla detectada
  const [template, setTemplate] = useState('tienda'); 

  // --- CARGA DE DATOS ---
  useEffect(() => {
    if (!slug) return;

    const fetchShopData = async () => {
      try {
        setLoading(true);

        // 1. Buscar Tienda
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .or(`slug_tienda.eq.${slug},slug_catalogo.eq.${slug},slug_menu.eq.${slug},slug_personal.eq.${slug}`)
          .maybeSingle();

        if (shopError) throw shopError;
        if (!shopData) {
            setError('Tienda no encontrada (404)');
            setLoading(false);
            return;
        }

        setShop(shopData);

        // 2. Detectar Plantilla (Igual que antes)
        let detectedTemplate = 'tienda';
        if (shopData.slug_catalogo === slug) detectedTemplate = 'catalogo';
        else if (shopData.slug_menu === slug) detectedTemplate = 'menu';
        else if (shopData.slug_personal === slug) detectedTemplate = 'personal';
        else detectedTemplate = shopData.template || 'tienda';
        
        setTemplate(detectedTemplate);

        // 3. Buscar Productos
        const tipoMap: any = { tienda: 'producto', catalogo: 'catalogo', menu: 'gastronomia', personal: 'enlace' };
        const tipoProducto = tipoMap[detectedTemplate] || 'producto';

        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopData.id)
          .eq('tipo', tipoProducto)
          .order('created_at', { ascending: true });

        if (prodError) console.error("Error Productos:", prodError);
        setProducts(productsData || []);

      } catch (err: any) {
        console.error("Error General:", err);
        setError('Error cargando la tienda.');
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [slug]);

  // --- LÓGICA DE ESTILOS (Traída de PhoneMockup) ---
  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Cargando...</div>;
  if (error || !shop) return <div style={{textAlign:'center', marginTop:50}}>{error}</div>;

  // Variables de estilo dinámicas (Modo Oscuro / Claro)
  const isDark = shop.plantilla_visual === 'Moderna'; // O la lógica que uses para dark mode
  const bgApp = isDark ? '#1a1a1a' : '#f8f8f8';
  const text = isDark ? '#ffffff' : '#333333';
  const cardBg = isDark ? '#333' : '#ffffff'; 
  const accentColor = isDark ? '#5dade2' : '#3498db';

  // Lógica de Grilla vs Lista
  const isGrid = template === 'tienda' || template === 'catalogo';
  const rowGapDinamico = template === 'menu' ? 50 : 15;

  // Filtro de búsqueda en tiempo real
  const productosFiltrados = products.filter((p: any) => 
    p.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función de Estilos Personales (Copiada exacta)
  const getPersonalStyle = (theme: string) => {
    const base = { padding: '16px', borderRadius: '50px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' as const, marginBottom: '0px', cursor: 'pointer', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', color: 'white', background: accentColor, textDecoration:'none', display:'block' };
    
    if (theme === 'neon') return { ...base, background: '#000', color: '#0f0', border: '2px solid #0f0', boxShadow: '0 0 10px #0f0' };
    if (theme === 'minimal') return { ...base, background: 'transparent', color: text, border: `2px solid ${text}`, boxShadow: 'none' };
    if (theme === 'glass') return { ...base, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', color: isDark?'white':'#333' };
    if (theme === 'flat') return { ...base, background: '#e74c3c', color: 'white', boxShadow: 'none' };
    return base;
  };

  return (
    <div style={{ minHeight: '100vh', background: bgApp, fontFamily: 'sans-serif', paddingBottom: 80 }}>
      {/* Contenedor centralizado para simular la app movil en pantallas grandes */}
      <div style={{ maxWidth: '480px', margin: '0 auto', background: bgApp, minHeight: '100vh', position:'relative' }}>
        
        {/* --- HEADER --- */}
        <div style={{ padding: '40px 20px 10px 20px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff', margin: '0 auto 15px', overflow:'hidden', border: '2px solid #ff9f43', padding: 2, boxShadow:'0 4px 10px rgba(0,0,0,0.1)' }}>
                <div style={{width:'100%', height:'100%', borderRadius:'50%', overflow:'hidden'}}>
                   {shop.logo_url ? <img src={shop.logo_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <span style={{fontSize:40, lineHeight:'75px'}}>😎</span>}
                </div>
            </div>
            <h2 style={{ margin: 0, fontSize: 22, color: text }}>{shop.nombre_negocio || 'Tu Negocio'}</h2>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#888', lineHeight: 1.4 }}>{shop.descripcion || 'Descripción del negocio...'}</p>
        </div>

        {/* --- BUSCADOR (Solo si no es personal) --- */}
        {template !== 'personal' && (
            <div style={{ padding: '0 20px', marginBottom: 20 }}>
                <div style={{ padding: '12px 20px', borderRadius: 50, fontSize: 14, backgroundColor: isDark ? '#333' : '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 10, border: isDark ? '1px solid #444' : 'none' }}>
                     <input 
                        type="text" 
                        placeholder="Buscar producto..." 
                        value={busqueda} 
                        onChange={(e) => setBusqueda(e.target.value)} 
                        style={{border:'none', background:'transparent', outline:'none', color: text, width:'100%', fontSize:14}} 
                     />
                     <span>🔍</span>
                </div>
            </div>
        )}

        {/* --- GRILLA DE PRODUCTOS (Lógica de PhoneMockup) --- */}
        <div style={{ 
            padding: '0 20px', 
            display: isGrid ? 'grid' : 'flex', 
            gridTemplateColumns: isGrid ? '1fr 1fr' : 'none', 
            flexDirection: isGrid ? 'row' : 'column', 
            gap: 12, 
            rowGap: rowGapDinamico, 
            marginTop: 25 
        }}>

            {/* CASO 1: PERSONAL (Links) */}
            {template === 'personal' && productosFiltrados.map((p: any) => (
                <a key={p.id} href={p.url_destino || '#'} target="_blank" style={getPersonalStyle(shop.personal_theme)}>
                    {p.titulo}
                </a>
            ))}

            {/* CASO 2: TIENDA Y CATÁLOGO */}
            {(template === 'tienda' || template === 'catalogo') && productosFiltrados.map((p: any) => {
                const imgUrl = p.imagen_url;
                // Ajuste de altura según mockup
                const isCatalogo = template === 'catalogo';
                const imgHeight = isCatalogo ? 110 : 150; 

                return (
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', backgroundColor: cardBg, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', width: '100%', gap: 0, borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: imgHeight, background: '#eee' }}>
                            {imgUrl ? (
                                <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                            ) : (
                                <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:'#ccc'}}>📷</div>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', padding: '12px', width: '100%', textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', fontSize: 14, color: text, marginBottom: 4, lineHeight: 1.2 }}>{p.titulo}</div>
                            
                            {/* Descripción truncada */}
                            <div style={{ fontSize: 11, color: '#888', marginBottom: 8, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                {p.descripcion}
                            </div>
                            
                            <div style={{ fontWeight: 'bold', fontSize: 16, color: '#27ae60', marginBottom: 10 }}>
                                {(isCatalogo && (!p.precio || p.precio == 0)) ? 'Consultar' : `$${p.precio}`}
                            </div>
                            
                            {/* Botón de acción */}
                            <a 
                                href={`https://wa.me/${shop.whatsapp}?text=Hola, me interesa ${p.titulo}`}
                                target="_blank"
                                style={{ width:'100%', padding:'8px 0', borderRadius: 8, background: isDark?'#444':'#e0e0e0', color: isDark?'#fff':'#555', textAlign:'center', fontSize:12, fontWeight:'bold', textDecoration:'none', display:'block' }}
                            >
                                {isCatalogo ? 'Ver' : 'Agregar'}
                            </a>
                        </div>
                    </div>
                );
            })}

            {/* CASO 3: MENÚ (Estilo Hamburguesa Flotante) */}
            {template === 'menu' && productosFiltrados.map((p: any) => {
                const imgUrl = p.imagen_url;
                return (
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: cardBg, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: '0 15px 20px 15px', borderRadius: 16, marginTop: 45, overflow: 'visible', position: 'relative', width: '100%' }}>
                        
                        {/* Imagen Flotante (Margen Negativo) */}
                        <div style={{ marginTop: -40, width: 100, height: 100, borderRadius: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', backgroundColor: '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                             {imgUrl ? <img src={imgUrl} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div style={{fontSize:40}}>🍔</div>}
                        </div>
                        
                        <div style={{textAlign:'center', width: '100%', marginTop: 15}}>
                            <div style={{ fontWeight: 'bold', color: text, fontSize: 16, lineHeight: 1.2 }}>{p.titulo}</div>
                            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{p.descripcion}</div>
                            <div style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 18, marginTop: 8 }}>${p.precio}</div>
                        </div>
                        
                        {/* Control de Cantidad (Visual) */}
                        <div style={{ display:'flex', alignItems:'center', gap: 15, marginTop: 15 }}>
                             <a href={`https://wa.me/${shop.whatsapp}?text=Quiero pedir: ${p.titulo}`} target="_blank" style={{background:'#27ae60', color:'white', padding:'8px 20px', borderRadius:20, textDecoration:'none', fontWeight:'bold', fontSize:14}}>
                                Pedir al WhatsApp
                             </a>
                        </div>
                    </div>
                );
            })}

        </div>

        {/* --- FOOTER FLOTANTE (Igual al Mockup) --- */}
        {(template !== 'personal') && (
            <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'480px', padding:'15px 20px', background: isDark ? '#222' : 'white', borderTop:`1px solid #eee`, display:'flex', justifyContent:'space-between', alignItems:'center', zIndex: 100, boxShadow:'0 -5px 20px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize:12, color:'#888'}}>Total: <b style={{color:text, fontSize:14}}>$0</b></div>
                <a href={`https://wa.me/${shop.whatsapp}`} target="_blank" style={{background:'#25D366', color:'white', padding:'8px 16px', borderRadius:20, fontSize:12, fontWeight:'bold', textDecoration:'none'}}>
                    WhatsApp
                </a>
            </div>
        )}

      </div>
    </div>
  );
}