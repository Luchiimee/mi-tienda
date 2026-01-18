'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';

export default function PublicShopPage() {
  const params = useParams();
  const slug = params?.slug as string; // El texto del link (ej: "mi-negocio")

  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    const fetchShopData = async () => {
      try {
        // 1. Buscamos la tienda que tenga este slug en CUALQUIERA de las columnas
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .or(`slug_tienda.eq.${slug},slug_catalogo.eq.${slug},slug_menu.eq.${slug},slug_personal.eq.${slug}`)
          .maybeSingle();

        if (shopError) throw shopError;
        if (!shopData) {
            setError('Tienda no encontrada');
            setLoading(false);
            return;
        }

        setShop(shopData);

        // 2. Determinamos qué tipo de plantilla es este slug específico
        let activeTemplate = 'tienda';
        if (shopData.slug_catalogo === slug) activeTemplate = 'catalogo';
        if (shopData.slug_menu === slug) activeTemplate = 'menu';
        if (shopData.slug_personal === slug) activeTemplate = 'personal';

        // 3. Convertimos el tipo de plantilla al tipo de producto de la base de datos
        // (tienda -> producto, menu -> gastronomia, etc.)
        const tipoMap: any = { 
            tienda: 'producto', 
            catalogo: 'catalogo', 
            menu: 'gastronomia', 
            personal: 'enlace' 
        };
        const tipoProducto = tipoMap[activeTemplate];

        // 4. Buscamos los productos de esa tienda y ese tipo
        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopData.id)
          .eq('tipo', tipoProducto);

        if (prodError) throw prodError;
        setProducts(productsData || []);

      } catch (err: any) {
        console.error(err);
        setError('Error cargando la tienda.');
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [slug]);

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#64748b'}}>Cargando tienda...</div>;
  if (error) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#ef4444'}}>{error}</div>;

  // --- RENDERIZADO BÁSICO DE LA TIENDA ---
  // (Aquí luego pondrás tus diseños bonitos, esto es para verificar que funciona)
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
        
        {/* CABECERA */}
        <div style={{textAlign:'center', marginBottom:30}}>
            {/* Buscamos el logo correspondiente a la plantilla actual */}
            {shop.logo_url && <img src={shop.logo_url} style={{width:80, height:80, borderRadius:'50%', objectFit:'cover', margin:'0 auto 10px'}} />}
            <h1 style={{margin:0}}>{shop.nombre_negocio || 'Mi Tienda'}</h1>
            <p style={{color:'#64748b'}}>{shop.descripcion || 'Bienvenido a nuestra tienda online.'}</p>
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div style={{display:'grid', gap:15}}>
            {products.map((prod) => (
                <div key={prod.id} style={{border:'1px solid #e2e8f0', borderRadius:12, padding:15, display:'flex', gap:15, alignItems:'center', background:'white', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
                    {prod.imagen_url && <img src={prod.imagen_url} style={{width:60, height:60, borderRadius:8, objectFit:'cover'}} />}
                    <div style={{flex:1}}>
                        <div style={{fontWeight:'bold'}}>{prod.titulo}</div>
                        <div style={{fontSize:12, color:'#64748b'}}>{prod.descripcion}</div>
                        {prod.precio && <div style={{fontWeight:'bold', color:'#3b82f6', marginTop:5}}>${prod.precio}</div>}
                    </div>
                    {/* Botón de acción (WhatsApp o Link) */}
                    {shop.whatsapp && (
                        <a 
                           href={`https://wa.me/${shop.whatsapp}?text=Hola, me interesa: ${prod.titulo}`} 
                           target="_blank"
                           style={{background:'#22c55e', color:'white', padding:'8px 12px', borderRadius:20, textDecoration:'none', fontSize:12, fontWeight:'bold'}}
                        >
                           Pedir
                        </a>
                    )}
                </div>
            ))}
        </div>

        {products.length === 0 && <div style={{textAlign:'center', color:'#94a3b8', marginTop:50}}>No hay productos disponibles aún.</div>}
    </div>
  );
}