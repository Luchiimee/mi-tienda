'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';

export default function PublicShopPage() {
  const params = useParams();
  const slug = params?.slug as string; 

  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ESTADO NUEVO: Para saber qué diseño mostrar
  const [template, setTemplate] = useState('tienda'); 

  useEffect(() => {
    if (!slug) return;

    const fetchShopData = async () => {
      try {
        setLoading(true);

        // 1. BUSCAR TIENDA
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

        // 2. DETERMINAR PLANTILLA ACTIVA VISUALMENTE
        // Si el slug coincide con una sección específica, usamos esa.
        // Si no, usamos la que el usuario eligió como principal en su admin.
        let detectedTemplate = 'tienda';
        
        if (shopData.slug_catalogo === slug) detectedTemplate = 'catalogo';
        else if (shopData.slug_menu === slug) detectedTemplate = 'menu';
        else if (shopData.slug_personal === slug) detectedTemplate = 'personal';
        else {
            // Si es el slug principal, respetamos la preferencia de la base de datos
            detectedTemplate = shopData.template || 'tienda';
        }
        
        setTemplate(detectedTemplate);

        // 3. BUSCAR PRODUCTOS
        const tipoMap: any = { tienda: 'producto', catalogo: 'catalogo', menu: 'gastronomia', personal: 'enlace' };
        // Si la plantilla es 'tienda', a veces queremos mostrar todo, pero aquí filtramos por lo que corresponda
        const tipoProducto = tipoMap[detectedTemplate] || 'producto';

        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopData.id)
          .eq('tipo', tipoProducto)
          .order('created_at', { ascending: true });

        if (prodError) console.error("❌ Error Productos:", prodError);
        setProducts(productsData || []);

      } catch (err: any) {
        console.error("🔥 Error General:", err);
        setError('Error cargando la tienda.');
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [slug]);

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#64748b'}}>⚡ Cargando...</div>;
  if (error) return <div style={{textAlign:'center', marginTop:50, color:'red'}}>{error}</div>;

  // --- COMPONENTES DE DISEÑO SEGÚN PLANTILLA ---

  // 🏪 DISEÑO 1: TIENDA (Clásico E-commerce)
  const RenderTienda = () => (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:15}}>
        {products.map((prod) => (
            <div key={prod.id} style={{border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden', background:'white'}}>
                <div style={{height:150, background:'#f1f5f9'}}>
                    {prod.imagen_url ? <img src={prod.imagen_url} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : null}
                </div>
                <div style={{padding:10}}>
                    <div style={{fontWeight:'bold', fontSize:14, marginBottom:5}}>{prod.titulo}</div>
                    <div style={{color:'#3b82f6', fontWeight:'bold'}}>${Number(prod.precio).toLocaleString()}</div>
                    <a href={`https://wa.me/${shop.whatsapp}?text=Quiero ${prod.titulo}`} target="_blank" style={{display:'block', textAlign:'center', background:'#22c55e', color:'white', padding:8, borderRadius:6, marginTop:10, textDecoration:'none', fontSize:12}}>Comprar</a>
                </div>
            </div>
        ))}
    </div>
  );

  // 📖 DISEÑO 2: CATÁLOGO (Elegante, foco en imagen) - ¡EL QUE QUERÍAS!
  const RenderCatalogo = () => (
    <div style={{display:'flex', flexDirection:'column', gap:25}}>
        {products.map((prod) => (
            <div key={prod.id} style={{background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 10px 20px rgba(0,0,0,0.05)'}}>
                <div style={{height:250, background:'#f8fafc'}}>
                    {prod.imagen_url && <img src={prod.imagen_url} style={{width:'100%', height:'100%', objectFit:'cover'}} />}
                </div>
                <div style={{padding:20}}>
                    <h3 style={{margin:0, fontSize:20, color:'#1e293b'}}>{prod.titulo}</h3>
                    <p style={{color:'#64748b', margin:'10px 0'}}>{prod.descripcion}</p>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:15}}>
                        <span style={{fontSize:22, fontWeight:'bold', color:'#334155'}}>${Number(prod.precio).toLocaleString()}</span>
                        <a href={`https://wa.me/${shop.whatsapp}?text=Consulta sobre ${prod.titulo}`} target="_blank" style={{border:'2px solid #1e293b', color:'#1e293b', padding:'8px 20px', borderRadius:30, textDecoration:'none', fontWeight:'bold'}}>Consultar</a>
                    </div>
                </div>
            </div>
        ))}
    </div>
  );

  // 🍔 DISEÑO 3: MENÚ (Gastronomía, lista simple)
  const RenderMenu = () => (
    <div style={{display:'flex', flexDirection:'column', gap:0}}>
        {products.map((prod) => (
            <div key={prod.id} style={{padding:'15px 0', borderBottom:'1px dashed #cbd5e1', display:'flex', justifyContent:'space-between', gap:15}}>
                <div style={{flex:1}}>
                    <div style={{fontWeight:'bold', fontSize:16, color:'#334155'}}>{prod.titulo}</div>
                    <div style={{fontSize:13, color:'#64748b', marginTop:4}}>{prod.descripcion}</div>
                    <div style={{marginTop:8, fontWeight:'bold', color:'#e11d48'}}>${Number(prod.precio).toLocaleString()}</div>
                </div>
                {prod.imagen_url && <img src={prod.imagen_url} style={{width:80, height:80, borderRadius:8, objectFit:'cover'}} />}
            </div>
        ))}
    </div>
  );

  // 👤 DISEÑO 4: PERSONAL (Links tipo Linktree)
  const RenderPersonal = () => (
    <div style={{display:'flex', flexDirection:'column', gap:15}}>
        {products.map((prod) => (
            <a key={prod.id} href={prod.url_destino || '#'} target="_blank" style={{background:'white', border:'1px solid #e2e8f0', padding:15, borderRadius:12, display:'flex', alignItems:'center', textDecoration:'none', color:'#1e293b', boxShadow:'0 2px 5px rgba(0,0,0,0.02)', transition:'transform 0.1s'}}>
                {prod.imagen_url && <img src={prod.imagen_url} style={{width:40, height:40, borderRadius:'50%', marginRight:15, objectFit:'cover'}} />}
                <div style={{fontWeight:'bold'}}>{prod.titulo}</div>
                <div style={{marginLeft:'auto', color:'#cbd5e1'}}>➜</div>
            </a>
        ))}
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', minHeight:'100vh', background: template === 'personal' ? '#f8fafc' : '#fff' }}>
        
        {/* CABECERA COMÚN */}
        <div style={{textAlign:'center', marginBottom:30, paddingBottom:20}}>
            {shop.logo_url && <img src={shop.logo_url} style={{width:100, height:100, borderRadius:'50%', objectFit:'cover', margin:'0 auto 15px', border:'4px solid white', boxShadow:'0 5px 15px rgba(0,0,0,0.1)'}} />}
            <h1 style={{margin:0, fontSize:26, color:'#1e293b'}}>{shop.nombre_negocio}</h1>
            <p style={{color:'#64748b', marginTop:8}}>{shop.descripcion}</p>
            
            {shop.whatsapp && (
                <a href={`https://wa.me/${shop.whatsapp}`} target="_blank" style={{display:'inline-flex', alignItems:'center', gap:8, marginTop:15, background:'#25D366', color:'white', padding:'8px 20px', borderRadius:30, textDecoration:'none', fontWeight:'bold', fontSize:14}}>
                   <span>Whatsapp</span>
                </a>
            )}
        </div>

        {/* SELECTOR DE PLANTILLA (SWITCH) */}
        <div>
            {template === 'tienda' && <RenderTienda />}
            {template === 'catalogo' && <RenderCatalogo />}
            {template === 'menu' && <RenderMenu />}
            {template === 'personal' && <RenderPersonal />}
            
            {products.length === 0 && (
                <div style={{textAlign:'center', color:'#94a3b8', padding:40, background:'#f1f5f9', borderRadius:16}}>
                    No hay contenido para mostrar en esta sección.
                </div>
            )}
        </div>
    </div>
  );
}
