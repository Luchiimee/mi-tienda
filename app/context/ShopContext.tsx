'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

// --- DATOS POR DEFECTO ---
const DEFAULT_TIENDA = [
  { titulo: 'Remera Básica', descripcion: 'Algodón 100% premium.', precio: '12000', galeria: [], imagen_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=60', tipo: 'producto' },
  { titulo: 'Jean Slim Fit', descripcion: 'Denim elastizado azul.', precio: '45000', galeria: [], imagen_url: 'https://images.unsplash.com/photo-1542272617-08f086303293?auto=format&fit=crop&w=500&q=60', tipo: 'producto' }
];
const DEFAULT_CATALOGO = [
  { titulo: 'Sofá 3 Cuerpos', descripcion: 'Pana antimanchas.', precio: '', galeria: [], imagen_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=60', tipo: 'catalogo' },
  { titulo: 'Mesa Ratona', descripcion: 'Madera maciza.', precio: '', galeria: [], imagen_url: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=500&q=60', tipo: 'catalogo' }
];
const DEFAULT_MENU = [
  { titulo: 'Hamburguesa Doble', descripcion: 'Cheddar y bacon.', precio: '9500', galeria: [], imagen_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60', tipo: 'gastronomia' },
  { titulo: 'Papas Rústicas', descripcion: 'Con cheddar y verdeo.', precio: '4500', galeria: [], imagen_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=500&q=60', tipo: 'gastronomia' }
];
const DEFAULT_LINKS = [
  { titulo: 'Mi WhatsApp', url_destino: 'https://wa.me/', descripcion: '', precio: '', galeria: [], tipo: 'enlace' },
  { titulo: 'Mi Instagram', url_destino: 'https://instagram.com', descripcion: '', precio: '', galeria: [], tipo: 'enlace' }
];

export type Product = { 
    id: string; titulo: string; descripcion: string; precio: string; 
    galeria?: string[]; url?: string; shop_id?: string; tipo?: string; imagen?: string; 
};

type ShopData = {
  id?: string; 
  email: string; // Nuevo campo para el email real
  nombreAdmin: string; // Saludo formateado
  template: string; slug: string; 
  slugs: { [key: string]: string }; logos: { [key: string]: string }; 
  nombreNegocio: string; descripcion: string; whatsapp: string; 
  logo: string; plantillaVisual: string; personalTheme: string;
  plan: 'none' | 'simple' | 'full'; 
  nombreDueno: string; apellidoDueno: string; templateLocked: string | null; lastTemplateChange: string | null; changeCount: number;
  productos: Product[];
};

const emptyState: ShopData = {
  email: '', nombreAdmin: '', template: 'tienda', slug: '', slugs: {}, logos: {}, nombreNegocio: '', descripcion: '', whatsapp: '', logo: '', plantillaVisual: 'Minimal', personalTheme: 'glass', plan: 'none', nombreDueno: '', apellidoDueno: '', templateLocked: null, lastTemplateChange: null, changeCount: 0, productos: []
};

const ShopContext = createContext<any>(null);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [shopData, setShopData] = useState<ShopData>(emptyState);

  const getTipo = (tmpl: string) => {
      if (tmpl === 'menu') return 'gastronomia';
      if (tmpl === 'personal') return 'enlace';
      if (tmpl === 'catalogo') return 'catalogo';
      return 'producto';
  };
  
  const getDefaults = (tmpl: string) => {
      if (tmpl === 'menu') return DEFAULT_MENU;
      if (tmpl === 'personal') return DEFAULT_LINKS;
      if (tmpl === 'catalogo') return DEFAULT_CATALOGO;
      return DEFAULT_TIENDA;
  };

  const loadShopData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    let { data: shop } = await supabase.from('shops').select('*').eq('owner_id', user.id).maybeSingle();

    if (!shop) {
       const { data: newShop } = await supabase.from('shops').insert([{ owner_id: user.id, slug_tienda: `tienda-${Date.now()}`, nombre_negocio: 'Mi Negocio', template: 'tienda', plan: 'none' }]).select().single();
       shop = newShop;
    }

    if (shop) {
      const tipoNecesario = getTipo(shop.template);
      let { data: items } = await supabase.from('products').select('*').eq('shop_id', shop.id).eq('tipo', tipoNecesario).order('created_at', { ascending: true });

      if (!items || items.length === 0) {
         const defaults = getDefaults(shop.template);
         const toInsert = defaults.map(p => ({ ...p, shop_id: shop.id, imagen_url: (p as any).imagen_url }));
         const { data: inserted } = await supabase.from('products').insert(toInsert).select();
         if (inserted) items = inserted;
      }

      const currentSlugs: any = { 
          tienda: shop.slug_tienda || '', 
          catalogo: shop.slug_catalogo || '', 
          menu: shop.slug_menu || '', 
          personal: shop.slug_personal || '' 
      };
      
      const currentLogos: any = { 
          tienda: shop.logo_tienda || '', 
          catalogo: shop.logo_catalogo || '', 
          menu: shop.logo_menu || '', 
          personal: shop.logo_personal || '' 
      };

      // GENERAR NOMBRE VISUAL (Nombre + Inicial Apellido)
      let nombreVisual = user.email?.split('@')[0] || 'Admin';
      if (shop.nombre_dueno) {
          nombreVisual = shop.nombre_dueno;
          if (shop.apellido_dueno) {
              nombreVisual += ` ${shop.apellido_dueno.charAt(0).toUpperCase()}.`;
          }
      }

      setShopData({
        id: shop.id, 
        email: user.email || '', // Email real
        nombreAdmin: nombreVisual, 
        template: shop.template, 
        slug: currentSlugs[shop.template] || '', slugs: currentSlugs,
        logos: currentLogos, 
        logo: currentLogos[shop.template] || '', 
        nombreNegocio: shop.nombre_negocio || '', descripcion: shop.descripcion || '', whatsapp: shop.whatsapp || '', 
        plantillaVisual: shop.plantilla_visual || 'Minimal', personalTheme: shop.personal_theme || 'glass', 
        plan: shop.plan || 'none', 
        nombreDueno: shop.nombre_dueno || '', apellidoDueno: shop.apellido_dueno || '', 
        templateLocked: shop.template_locked || null, lastTemplateChange: shop.last_template_change, changeCount: shop.change_count || 0,
        productos: items?.map(p => ({ id: p.id, titulo: p.titulo, descripcion: p.descripcion, precio: p.precio, galeria: p.galeria || [], url: p.url_destino, shop_id: p.shop_id, tipo: p.tipo, imagen: p.imagen_url })) || []
      });
    }
  };

  useEffect(() => { loadShopData(); }, []);

  const changeTemplate = async (newTemplate: string) => {
    if (shopData.plan === 'simple' && shopData.templateLocked && shopData.templateLocked !== newTemplate) return;
    
    setShopData(prev => ({ 
        ...prev, 
        template: newTemplate, 
        productos: [], 
        logo: prev.logos[newTemplate] || '', 
        slug: prev.slugs[newTemplate] || '' 
    }));
    
    if (shopData.id) {
       await supabase.from('shops').update({ template: newTemplate }).eq('id', shopData.id);
       const tipoNecesario = getTipo(newTemplate);
       let { data: items } = await supabase.from('products').select('*').eq('shop_id', shopData.id).eq('tipo', tipoNecesario).order('created_at', { ascending: true });

       if (!items || items.length === 0) {
          const defaults = getDefaults(newTemplate);
          const toInsert = defaults.map(p => ({ ...p, shop_id: shopData.id, imagen_url: (p as any).imagen_url }));
          const { data: inserted } = await supabase.from('products').insert(toInsert).select();
          if (inserted) items = inserted;
       }

       setShopData(prev => ({ 
           ...prev, template: newTemplate, 
           productos: items?.map(p => ({ id: p.id, titulo: p.titulo, descripcion: p.descripcion, precio: p.precio, galeria: [], url: p.url_destino, shop_id: p.shop_id, tipo: p.tipo, imagen: p.imagen_url })) || [] 
       }));
    }
  };

  const updateConfig = async (newData: any) => {
    if (!canEdit()) return;
    
    setShopData((prev) => {
        const updatedSlugs = { ...prev.slugs };
        const updatedLogos = { ...prev.logos };
        if (newData.slug !== undefined) updatedSlugs[prev.template] = newData.slug;
        if (newData.logos) Object.assign(updatedLogos, newData.logos);
        else if (newData.logo !== undefined) updatedLogos[prev.template] = newData.logo;
        
        return { ...prev, ...newData, slugs: updatedSlugs, logos: updatedLogos, logo: (newData.logo !== undefined) ? newData.logo : prev.logo };
    });

    if (shopData.id) {
        const dbData: any = { nombre_negocio: newData.nombreNegocio, descripcion: newData.descripcion, whatsapp: newData.whatsapp, plantilla_visual: newData.plantillaVisual, personal_theme: newData.personalTheme };
        if (newData.logo !== undefined) {
             dbData.logo_url = newData.logo; 
             if(shopData.template === 'tienda') dbData.logo_tienda = newData.logo;
             if(shopData.template === 'catalogo') dbData.logo_catalogo = newData.logo;
             if(shopData.template === 'menu') dbData.logo_menu = newData.logo;
             if(shopData.template === 'personal') dbData.logo_personal = newData.logo;
        }
        if (newData.slug !== undefined) {
            if(shopData.template === 'tienda') dbData.slug_tienda = newData.slug;
            if(shopData.template === 'catalogo') dbData.slug_catalogo = newData.slug;
            if(shopData.template === 'menu') dbData.slug_menu = newData.slug;
            if(shopData.template === 'personal') dbData.slug_personal = newData.slug;
        }
        await supabase.from('shops').update(dbData).eq('id', shopData.id);
    }
  };

  const updateTemplateSlug = async (tmpl: string, newSlug: string) => {
      if (!canEdit() || !shopData.id) return;
      setShopData((prev) => {
          const updatedSlugs = { ...prev.slugs, [tmpl]: newSlug };
          return { ...prev, slugs: updatedSlugs, slug: (prev.template === tmpl) ? newSlug : prev.slug };
      });
      const dbData: any = {};
      if(tmpl === 'tienda') dbData.slug_tienda = newSlug;
      if(tmpl === 'catalogo') dbData.slug_catalogo = newSlug;
      if(tmpl === 'menu') dbData.slug_menu = newSlug;
      if(tmpl === 'personal') dbData.slug_personal = newSlug;
      await supabase.from('shops').update(dbData).eq('id', shopData.id);
  };

  const resetTemplate = async (tmplToReset: string) => {
      if(!shopData.id) return;
      const newSlugs = { ...shopData.slugs, [tmplToReset]: '' };
      const newLogos = { ...shopData.logos, [tmplToReset]: '' };
      setShopData(prev => ({ ...prev, slugs: newSlugs, logos: newLogos }));
      const dbData: any = {};
      if(tmplToReset === 'tienda') { dbData.slug_tienda = null; dbData.logo_tienda = null; }
      if(tmplToReset === 'catalogo') { dbData.slug_catalogo = null; dbData.logo_catalogo = null; }
      if(tmplToReset === 'menu') { dbData.slug_menu = null; dbData.logo_menu = null; }
      if(tmplToReset === 'personal') { dbData.slug_personal = null; dbData.logo_personal = null; }
      await supabase.from('shops').update(dbData).eq('id', shopData.id);
      const tipo = getTipo(tmplToReset);
      await supabase.from('products').delete().eq('shop_id', shopData.id).eq('tipo', tipo);
      if (shopData.template === tmplToReset) changeTemplate(tmplToReset);
  };

  const lockTemplate = async (selectedTemplate: string) => {
      if(!shopData.id) return;
      if(confirm(`¿Confirmar "${selectedTemplate.toUpperCase()}" como única plantilla?`)) {
          const now = new Date().toISOString();
          await supabase.from('shops').update({ template: selectedTemplate, template_locked: selectedTemplate, last_template_change: now }).eq('id', shopData.id);
          setShopData(prev => ({ ...prev, template: selectedTemplate, templateLocked: selectedTemplate, lastTemplateChange: now }));
          return true;
      }
      return false;
  };

  // --- FUNCIÓN ACTUALIZADA PARA REFRESCAR EL SALUDO AL INSTANTE ---
  const updateProfile = async (data: any) => {
      setShopData(prev => {
          // Calculamos el nuevo nombre visual inmediatamente
          let nuevoNombre = prev.nombreAdmin;
          if (data.nombreDueno || data.apellidoDueno) {
              const n = data.nombreDueno || prev.nombreDueno;
              const a = data.apellidoDueno || prev.apellidoDueno;
              if(n) nuevoNombre = `${n} ${a ? a.charAt(0).toUpperCase() + '.' : ''}`;
          }
          return { ...prev, ...data, nombreAdmin: nuevoNombre };
      });

      if(shopData.id) {
          const dbData: any = {};
          if(data.nombreDueno !== undefined) dbData.nombre_dueno = data.nombreDueno;
          if(data.apellidoDueno !== undefined) dbData.apellido_dueno = data.apellidoDueno;
          if(data.plan !== undefined) { dbData.plan = data.plan; if(data.plan === 'full') dbData.template_locked = null; }
          await supabase.from('shops').update(dbData).eq('id', shopData.id);
      }
  };

  const canEdit = () => (shopData.plan === 'full' || (shopData.plan === 'simple' && shopData.templateLocked)) ? true : false;
  
  // (Resto de funciones: checkTemplateChangeAllowed, changePassword, manualSave, addProduct, updateProduct, deleteProduct... IGUAL QUE ANTES)
  const checkTemplateChangeAllowed = () => { if (shopData.plan === 'full' || !shopData.templateLocked) return { allowed: true }; if (!shopData.lastTemplateChange) return { allowed: true }; const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(shopData.lastTemplateChange).getTime()) / (1000 * 60 * 60 * 24)); if (diffDays >= 30) return { allowed: true }; return { allowed: false, daysLeft: 30 - diffDays }; };
  const changePassword = async (p: string) => (await supabase.auth.updateUser({ password: p })).error;
  const manualSave = async () => true; 
  const addProduct = async (prod: Product) => { if (!canEdit() || !shopData.id) return; const tipoActual = getTipo(shopData.template); const { data } = await supabase.from('products').insert([{ shop_id: shopData.id, titulo: prod.titulo, descripcion: prod.descripcion, precio: prod.precio, galeria: [], url_destino: prod.url, tipo: tipoActual, imagen_url: prod.imagen }]).select().single(); if (data) setShopData((prev:any) => ({ ...prev, productos: [...prev.productos, { id: data.id, titulo: data.titulo, descripcion: data.descripcion, precio: data.precio, galeria: [], url: data.url_destino, shop_id: data.shop_id, tipo: data.tipo, imagen: data.imagen_url }] })); };
  const updateProduct = async (id: string, data: Partial<Product>) => { if (!canEdit()) return; setShopData((prev:any) => ({ ...prev, productos: prev.productos.map((p:any) => (p.id === id ? { ...p, ...data } : p)) })); const dbData: any = {}; if (data.titulo !== undefined) dbData.titulo = data.titulo; if (data.descripcion !== undefined) dbData.descripcion = data.descripcion; if (data.precio !== undefined) dbData.precio = data.precio; if (data.url !== undefined) dbData.url_destino = data.url; if (data.imagen !== undefined) dbData.imagen_url = data.imagen; await supabase.from('products').update(dbData).eq('id', id); };
  const deleteProduct = async (id: string) => { if (!canEdit()) return; setShopData((prev:any) => ({ ...prev, productos: prev.productos.filter((p:any) => p.id !== id) })); await supabase.from('products').delete().eq('id', id); };

  return (
    <ShopContext.Provider value={{ shopData, updateConfig, changeTemplate, addProduct, updateProduct, deleteProduct, updateProfile, lockTemplate, canEdit, changePassword, manualSave, resetTemplate, updateTemplateSlug }}>
      {children}
    </ShopContext.Provider>
  );
};
export const useShop = () => useContext(ShopContext);