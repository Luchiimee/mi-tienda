'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

// --- DATOS POR DEFECTO ---
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

export type Product = {
  id: string; titulo: string; descripcion: string; precio: string;
  imagen?: string; url?: string; shop_id?: string; tipo?: string;
};

type ShopData = {
  id?: string; nombreAdmin: string; template: string; slug: string;
  nombreNegocio: string; descripcion: string; whatsapp: string;
  logo: string; plantillaVisual: string; personalTheme: string;
  plan: string;         // 'simple' | 'full'
  nombreDueno: string;
  apellidoDueno: string;
  templateLocked: string | null; 
  lastTemplateChange: string | null;
  changeCount: number;
  productos: Product[];
};

const emptyState: ShopData = {
  nombreAdmin: '', template: 'tienda', slug: '', nombreNegocio: '', descripcion: '',
  whatsapp: '', logo: '', plantillaVisual: 'Minimal', personalTheme: 'glass', 
  plan: 'simple', nombreDueno: '', apellidoDueno: '', templateLocked: null, 
  lastTemplateChange: null, changeCount: 0, productos: []
};

const ShopContext = createContext<any>(null);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [shopData, setShopData] = useState<ShopData>(emptyState);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    let { data: shop } = await supabase.from('shops').select('*').eq('owner_id', user.id).maybeSingle();

    if (!shop) {
       const { data: newShop } = await supabase.from('shops').insert([{ 
           owner_id: user.id, slug: `tienda-${Date.now()}`, nombre_negocio: 'Mi Negocio', template: 'tienda', plan: 'simple'
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
        plan: shop.plan || 'simple',
        nombreDueno: shop.nombre_dueno || '',
        apellidoDueno: shop.apellido_dueno || '',
        templateLocked: shop.template_locked || null,
        lastTemplateChange: shop.last_template_change,
        changeCount: shop.change_count || 0,
        productos: items?.map(p => ({
          id: p.id, titulo: p.titulo, descripcion: p.descripcion, precio: p.precio,
          imagen: p.imagen_url, url: p.url_destino, shop_id: p.shop_id, tipo: p.tipo
        })) || []
      });
    }
    setLoading(false);
  };

  useEffect(() => { loadShopData(); }, []);

  // --- LÓGICA DE RESTRICCIÓN DE CAMBIO (30 DÍAS) ---
  const checkTemplateChangeAllowed = () => {
      // Si es Full, siempre puede
      if (shopData.plan === 'full') return { allowed: true };
      
      // Si nunca eligió (es la primera vez), puede
      if (!shopData.templateLocked) return { allowed: true };

      // Si ya eligió, verificamos la regla
      // 1. ¿Es el primer cambio pos-confirmación? (change_count bajo)
      //    Digamos que permitimos 1 corrección inmediata.
      //    Pero tu regla dice: "Un cambio la primera vez, el otro a los 30 días".
      
      if (!shopData.lastTemplateChange) return { allowed: true }; // Nunca cambió fecha

      const lastDate = new Date(shopData.lastTemplateChange);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays >= 30) return { allowed: true };
      
      return { allowed: false, daysLeft: 30 - diffDays };
  };

  const changeTemplate = async (newTemplate: string) => {
    // Solo actualiza visualmente para "Probar", NO guarda en DB a menos que se confirme en Config.
    // EXCEPCIÓN: Si es Plan Full, guarda directo.
    
    if (shopData.plan === 'full') {
         setShopData(prev => ({ ...prev, template: newTemplate, productos: [] }));
         if(shopData.id) {
             await supabase.from('shops').update({ template: newTemplate }).eq('id', shopData.id);
             await reloadProducts(newTemplate);
         }
    } else {
        // Plan Simple: Solo visual (Preview)
        setShopData(prev => ({ ...prev, template: newTemplate }));
        // Recargamos productos visualmente para que vea como queda, pero no guardamos template en DB shop todavía
        await reloadProducts(newTemplate);
    }
  };

  const reloadProducts = async (tmpl: string) => {
       const tipoNecesario = getTipo(tmpl);
       let { data: items } = await supabase.from('products').select('*').eq('shop_id', shopData.id).eq('tipo', tipoNecesario).order('created_at', { ascending: true });
       if (!items || items.length === 0) {
          const defaults = getDefaults(tmpl);
          const toInsert = defaults.map(p => ({ ...p, shop_id: shopData.id }));
          const { data: inserted } = await supabase.from('products').insert(toInsert).select();
          if (inserted) items = inserted;
       }
       setShopData(prev => ({
           ...prev,
           productos: items?.map(p => ({
            id: p.id, titulo: p.titulo, descripcion: p.descripcion, precio: p.precio,
            imagen: p.imagen_url, url: p.url_destino, shop_id: p.shop_id, tipo: p.tipo
          })) || []
       }));
  };

  // --- CONFIRMAR PLANTILLA DEFINITIVA (CON REGLA DE 30 DIAS) ---
  const lockTemplate = async (selectedTemplate: string) => {
      if(!shopData.id) return;
      
      const { allowed, daysLeft } = checkTemplateChangeAllowed();
      
      if (!allowed) {
          alert(`⚠️ Ya realizaste un cambio reciente. Debes esperar ${daysLeft} días para volver a cambiar de plantilla en el Plan Simple.`);
          return false;
      }

      const confirmed = window.confirm(`¿Confirmar "${selectedTemplate.toUpperCase()}" como definitiva?\n\nEn Plan Simple podrás cambiarla 1 vez más ahora, y luego cada 30 días.`);
      if(confirmed) {
          const now = new Date().toISOString();
          const newCount = (shopData.changeCount || 0) + 1;

          await supabase.from('shops').update({ 
              template: selectedTemplate,
              template_locked: selectedTemplate,
              last_template_change: now,
              change_count: newCount
          }).eq('id', shopData.id);

          setShopData(prev => ({ 
              ...prev, 
              template: selectedTemplate,
              templateLocked: selectedTemplate,
              lastTemplateChange: now,
              changeCount: newCount
          }));
          return true;
      }
      return false;
  };

  const updateProfile = async (data: { nombreDueno?: string, apellidoDueno?: string, plan?: string }) => {
      setShopData(prev => ({ ...prev, ...data }));
      if(shopData.id) {
          const dbData: any = {};
          if(data.nombreDueno !== undefined) dbData.nombre_dueno = data.nombreDueno;
          if(data.apellidoDueno !== undefined) dbData.apellido_dueno = data.apellidoDueno;
          if(data.plan !== undefined) {
              dbData.plan = data.plan;
              if(data.plan === 'full') {
                  dbData.template_locked = null; // Liberar si pasa a full
              }
          }
          await supabase.from('shops').update(dbData).eq('id', shopData.id);
          if(data.plan === 'full') setShopData(prev => ({ ...prev, templateLocked: null }));
      }
  };

  const changePassword = async (newPass: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      return error;
  };

  // --- VALIDACIÓN DE EDICIÓN ---
  const canEdit = () => {
      if (shopData.plan === 'full') return true;
      // En simple, solo puede editar si ya hay un templateLocked
      if (shopData.plan === 'simple' && shopData.templateLocked) return true;
      return false;
  };

  const addProduct = async (prod: Product) => {
    if (!canEdit()) { alert("⚠️ Antes de editar, ve a CONFIGURACIÓN y elige tu Plan/Plantilla."); return; }
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
    if (!canEdit()) { alert("⚠️ Primero ve a CONFIGURACIÓN y confirma tu Plantilla."); return; }
    setShopData((prev) => ({ ...prev, ...newData }));
    if (shopData.id) {
        await supabase.from('shops').update({ 
            nombre_negocio: newData.nombreNegocio, 
            descripcion: newData.descripcion,
            whatsapp: newData.whatsapp,
            slug: newData.slug,
            logo_url: newData.logo,
            plantilla_visual: newData.plantillaVisual,
            personal_theme: newData.personalTheme
        }).eq('id', shopData.id);
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    if (!canEdit()) { alert("⚠️ Primero ve a CONFIGURACIÓN y confirma tu Plantilla."); return; }
    setShopData((prev) => ({ ...prev, productos: prev.productos.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
    await supabase.from('products').update({
        titulo: data.titulo, descripcion: data.descripcion, precio: data.precio,
        imagen_url: data.imagen, url_destino: data.url
    }).eq('id', id);
  };

  const deleteProduct = async (id: string) => {
    if (!canEdit()) return;
    setShopData((prev) => ({ ...prev, productos: prev.productos.filter((p) => p.id !== id) }));
    await supabase.from('products').delete().eq('id', id);
  };

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>⚡ Cargando...</div>;

  return (
    <ShopContext.Provider value={{ shopData, updateConfig, changeTemplate, addProduct, updateProduct, deleteProduct, updateProfile, lockTemplate, canEdit, changePassword }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);