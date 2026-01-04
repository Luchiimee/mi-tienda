'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

// --- 1. DATOS POR DEFECTO (EXACTAMENTE 2 POR CADA UNO) ---

const DEFAULT_TIENDA = [
  { titulo: 'Remera Básica', descripcion: 'Algodón 100% premium.', precio: '12000', imagen_url: '', url_destino: '', tipo: 'producto' },
  { titulo: 'Jean Slim Fit', descripcion: 'Denim elastizado azul.', precio: '45000', imagen_url: '', url_destino: '', tipo: 'producto' }
];

const DEFAULT_CATALOGO = [
  { titulo: 'Sofá 3 Cuerpos', descripcion: 'Pana antimanchas. Varios colores.', precio: '', imagen_url: '', url_destino: '', tipo: 'catalogo' },
  { titulo: 'Mesa Ratona', descripcion: 'Madera maciza 80x40cm.', precio: '', imagen_url: '', url_destino: '', tipo: 'catalogo' }
];

const DEFAULT_MENU = [
  { titulo: 'Hamburguesa Doble', descripcion: 'Doble carne, cheddar y bacon.', precio: '9500', imagen_url: '', url_destino: '', tipo: 'gastronomia' },
  { titulo: 'Papas Rusticas', descripcion: 'Con cheddar, panceta y verdeo.', precio: '4500', imagen_url: '', url_destino: '', tipo: 'gastronomia' }
];

const DEFAULT_LINKS = [
  { titulo: 'Mi Portfolio', url_destino: '#', descripcion: '', precio: '', imagen_url: '', tipo: 'enlace' },
  { titulo: 'WhatsApp', url_destino: 'https://wa.me/', descripcion: '', precio: '', imagen_url: '', tipo: 'enlace' }
];

// --- TIPOS ---
export type Product = {
  id: string; titulo: string; descripcion: string; precio: string;
  imagen?: string; url?: string; shop_id?: string; tipo?: string;
};

type ShopData = {
  id?: string; nombreAdmin: string; template: string; slug: string;
  nombreNegocio: string; descripcion: string; whatsapp: string;
  logo: string; plantillaVisual: string; personalTheme: string;
  productos: Product[];
};

const emptyState: ShopData = {
  nombreAdmin: '', template: 'tienda', slug: '', nombreNegocio: '', descripcion: '',
  whatsapp: '', logo: '', plantillaVisual: 'Minimal', personalTheme: 'glass', productos: []
};

const ShopContext = createContext<any>(null);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [shopData, setShopData] = useState<ShopData>(emptyState);
  const [loading, setLoading] = useState(true);

  // --- SEPARACIÓN DE CAJONES (TIPOS DE DATOS) ---
  const getTipo = (tmpl: string) => {
      if (tmpl === 'menu') return 'gastronomia';
      if (tmpl === 'personal') return 'enlace';
      if (tmpl === 'catalogo') return 'catalogo'; // Cajón propio
      return 'producto'; // Cajón Tienda
  };

  const getDefaults = (tmpl: string) => {
      if (tmpl === 'menu') return DEFAULT_MENU;
      if (tmpl === 'personal') return DEFAULT_LINKS;
      if (tmpl === 'catalogo') return DEFAULT_CATALOGO;
      return DEFAULT_TIENDA;
  };

  const loadShopData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    let { data: shop } = await supabase.from('shops').select('*').eq('owner_id', user.id).maybeSingle();

    if (!shop) {
       const { data: newShop } = await supabase.from('shops').insert([{ 
           owner_id: user.id, slug: `tienda-${Date.now()}`, nombre_negocio: 'Mi Negocio', template: 'tienda'
       }]).select().single();
       shop = newShop;
    }

    if (shop) {
      const tipoNecesario = getTipo(shop.template);
      let { data: items } = await supabase.from('products').select('*').eq('shop_id', shop.id).eq('tipo', tipoNecesario).order('created_at', { ascending: true });

      if (!items || items.length === 0) {
         const defaults = getDefaults(shop.template);
         const toInsert = defaults.map(p => ({ ...p, shop_id: shop.id }));
         const { data: inserted } = await supabase.from('products').insert(toInsert).select();
         if (inserted) items = inserted;
      }

      setShopData({
        id: shop.id, nombreAdmin: user.email?.split('@')[0] || 'Admin',
        template: shop.template, slug: shop.slug, nombreNegocio: shop.nombre_negocio || '',
        descripcion: shop.descripcion || '', whatsapp: shop.whatsapp || '', logo: shop.logo_url || '',
        plantillaVisual: shop.plantilla_visual || 'Minimal', personalTheme: shop.personal_theme || 'glass',
        productos: items?.map(p => ({
          id: p.id, titulo: p.titulo, descripcion: p.descripcion, precio: p.precio,
          imagen: p.imagen_url, url: p.url_destino, shop_id: p.shop_id, tipo: p.tipo
        })) || []
      });
    }
    setLoading(false);
  };

  useEffect(() => { loadShopData(); }, []);

  const changeTemplate = async (newTemplate: string) => {
    setShopData(prev => ({ ...prev, template: newTemplate, productos: [] }));
    if (shopData.id) {
       await supabase.from('shops').update({ template: newTemplate }).eq('id', shopData.id);
       const tipoNecesario = getTipo(newTemplate);
       
       let { data: items } = await supabase.from('products').select('*').eq('shop_id', shopData.id).eq('tipo', tipoNecesario).order('created_at', { ascending: true });

       if (!items || items.length === 0) {
          const defaults = getDefaults(newTemplate);
          const toInsert = defaults.map(p => ({ ...p, shop_id: shopData.id }));
          const { data: inserted } = await supabase.from('products').insert(toInsert).select();
          if (inserted) items = inserted;
       }

       setShopData(prev => ({
           ...prev, template: newTemplate,
           productos: items?.map(p => ({
            id: p.id, titulo: p.titulo, descripcion: p.descripcion, precio: p.precio,
            imagen: p.imagen_url, url: p.url_destino, shop_id: p.shop_id, tipo: p.tipo
          })) || []
       }));
    }
  };

  const addProduct = async (prod: Product) => {
    if (!shopData.id) return;
    const tipoActual = getTipo(shopData.template); 
    const { data } = await supabase.from('products').insert([{
        shop_id: shopData.id, titulo: prod.titulo, descripcion: prod.descripcion, precio: prod.precio,
        imagen_url: prod.imagen, url_destino: prod.url, tipo: tipoActual 
    }]).select().single();

    if (data) {
        setShopData((prev) => ({ ...prev, productos: [...prev.productos, {
            id: data.id, titulo: data.titulo, descripcion: data.descripcion, precio: data.precio,
            imagen: data.imagen_url, url: data.url_destino, shop_id: data.shop_id, tipo: data.tipo
        }] }));
    }
  };

  const updateConfig = async (newData: any) => {
    setShopData((prev) => ({ ...prev, ...newData }));
    if (shopData.id) {
        const dbData: any = {};
        if (newData.nombreNegocio !== undefined) dbData.nombre_negocio = newData.nombreNegocio;
        if (newData.descripcion !== undefined) dbData.descripcion = newData.descripcion;
        if (newData.whatsapp !== undefined) dbData.whatsapp = newData.whatsapp;
        if (newData.slug !== undefined) dbData.slug = newData.slug;
        if (newData.logo !== undefined) dbData.logo_url = newData.logo;
        if (newData.plantillaVisual !== undefined) dbData.plantilla_visual = newData.plantillaVisual;
        if (newData.personalTheme !== undefined) dbData.personal_theme = newData.personalTheme;
        await supabase.from('shops').update(dbData).eq('id', shopData.id);
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    setShopData((prev) => ({ ...prev, productos: prev.productos.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
    const dbData: any = {};
    if (data.titulo !== undefined) dbData.titulo = data.titulo;
    if (data.descripcion !== undefined) dbData.descripcion = data.descripcion;
    if (data.precio !== undefined) dbData.precio = data.precio;
    if (data.imagen !== undefined) dbData.imagen_url = data.imagen;
    if (data.url !== undefined) dbData.url_destino = data.url;
    await supabase.from('products').update(dbData).eq('id', id);
  };

  const deleteProduct = async (id: string) => {
    setShopData((prev) => ({ ...prev, productos: prev.productos.filter((p) => p.id !== id) }));
    await supabase.from('products').delete().eq('id', id);
  };

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>⚡ Cargando...</div>;

  return (
    <ShopContext.Provider value={{ shopData, updateConfig, changeTemplate, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);