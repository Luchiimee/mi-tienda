'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';

export default function PublicShopPage() {
  const params = useParams();
  // Manejo seguro del slug (evita errores si es undefined)
  const slug = params?.slug as string; 

  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Si no hay slug todavía, esperamos.
    if (!slug) return;

    console.log("🔍 Buscando tienda para el slug:", slug);

    const fetchShopData = async () => {
      try {
        setLoading(true);

        // 2. BUSCAR TIENDA
        // Usamos la sintaxis OR segura
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .or(`slug_tienda.eq.${slug},slug_catalogo.eq.${slug},slug_menu.eq.${slug},slug_personal.eq.${slug}`)
          .maybeSingle();

        if (shopError) {
            console.error("❌ Error Supabase (Shop):", shopError);
            throw shopError;
        }

        if (!shopData) {
            console.warn("⚠️ Tienda no encontrada en DB");
            setError('Tienda no encontrada (404)');
            setLoading(false);
            return;
        }

        console.log("✅ Tienda encontrada:", shopData.nombre_negocio);
        setShop(shopData);

        // 3. DETERMINAR PLANTILLA ACTIVA
        let activeTemplate = 'tienda';
        if (shopData.slug_catalogo === slug) activeTemplate = 'catalogo';
        if (shopData.slug_menu === slug) activeTemplate = 'menu';
        if (shopData.slug_personal === slug) activeTemplate = 'personal';

        // 4. BUSCAR PRODUCTOS
        const tipoMap: any = { tienda: 'producto', catalogo: 'catalogo', menu: 'gastronomia', personal: 'enlace' };
        const tipoProducto = tipoMap[activeTemplate];

        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopData.id)
          .eq('tipo', tipoProducto)
          .order('created_at', { ascending: true }); // Ordenar para que no salten

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

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#64748b', fontSize:20}}>⚡ Cargando tienda...</div>;
  
  if (error) return (
      <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',height:'100vh',color:'#ef4444'}}>
          <div style={{fontSize:40, marginBottom:10}}>😕</div>
          <div>{error}</div>
          <a href="/" style={{marginTop:20, color:'#3b82f6', textDecoration:'underline'}}>Volver al inicio</a>
      </div>
  );

  // --- RENDERIZADO DE LA TIENDA ---
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', minHeight:'100vh', background:'#fff' }}>
        
        {/* CABECERA */}
        <div style={{textAlign:'center', marginBottom:30, paddingBottom:20, borderBottom:'1px solid #f1f5f9'}}>
            {shop.logo_url && <img src={shop.logo_url} style={{width:100, height:100, borderRadius:'50%', objectFit:'cover', margin:'0 auto 15px', border:'3px solid white', boxShadow:'0 5px 15px rgba(0,0,0,0.1)'}} />}
            <h1 style={{margin:0, fontSize:24, color:'#1e293b'}}>{shop.nombre_negocio || 'Mi Tienda'}</h1>
            <p style={{color:'#64748b', marginTop:5}}>{shop.descripcion}</p>
            
            {/* BOTÓN WHATSAPP PRINCIPAL */}
            {shop.whatsapp && (
                <a href={`https://wa.me/${shop.whatsapp}`} target="_blank" style={{display:'inline-block', marginTop:15, background:'#22c55e', color:'white', padding:'10px 20px', borderRadius:30, textDecoration:'none', fontWeight:'bold', boxShadow:'0 4px 10px rgba(34, 197, 94, 0.3)'}}>
                    💬 Contactar por WhatsApp
                </a>
            )}
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div style={{display:'grid', gap:15}}>
            {products.map((prod) => (
                <div key={prod.id} style={{border:'1px solid #e2e8f0', borderRadius:16, padding:15, display:'flex', gap:15, alignItems:'center', background:'white', boxShadow:'0 2px 5px rgba(0,0,0,0.03)'}}>
                    {prod.imagen_url && <img src={prod.imagen_url} style={{width:70, height:70, borderRadius:12, objectFit:'cover'}} />}
                    
                    <div style={{flex:1}}>
                        <div style={{fontWeight:'bold', color:'#334155', marginBottom:4}}>{prod.titulo}</div>
                        {prod.descripcion && <div style={{fontSize:13, color:'#64748b', marginBottom:5, lineHeight:1.4}}>{prod.descripcion}</div>}
                        
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:5}}>
                            {prod.precio && <div style={{fontWeight:'800', color:'#3b82f6', fontSize:16}}>${Number(prod.precio).toLocaleString()}</div>}
                            
                            {/* Acción según tipo */}
                            {shop.whatsapp ? (
                                <a 
                                   href={`https://wa.me/${shop.whatsapp}?text=Hola, me interesa: ${prod.titulo}`} 
                                   target="_blank"
                                   style={{background:'#f1f5f9', color:'#334155', padding:'6px 12px', borderRadius:8, textDecoration:'none', fontSize:12, fontWeight:'bold'}}
                                >
                                   Pedir ↗
                                </a>
                            ) : (prod.url_destino ? (
                                <a href={prod.url_destino} target="_blank" style={{background:'#f1f5f9', color:'#334155', padding:'6px 12px', borderRadius:8, textDecoration:'none', fontSize:12, fontWeight:'bold'}}>Ver ↗</a>
                            ) : null)}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {products.length === 0 && (
            <div style={{textAlign:'center', color:'#94a3b8', marginTop:50, padding:20, background:'#f8fafc', borderRadius:12}}>
                <div style={{fontSize:30}}>📭</div>
                <p>No hay productos disponibles aún.</p>
            </div>
        )}
    </div>
  );
}