'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

const ADMIN_EMAIL = 'luchiimee2@gmail.com'.toLowerCase();

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

export type Product = { id: string; titulo: string; descripcion: string; precio: string; galeria?: string[]; url?: string; shop_id?: string; tipo?: string; imagen?: string; imagen_url?: string; };

type ShopData = {
  id?: string; email: string; nombreAdmin: string; template: string; slug: string; slugs: { [key: string]: string }; logos: { [key: string]: string }; 
  nombreNegocio: string; descripcion: string; whatsapp: string; logo: string; plantillaVisual: string; personalTheme: string;
  plan: 'none' | 'simple' | 'full'; 
  nombreDueno: string; apellidoDueno: string; telefonoDueno: string;
  templateLocked: string | null; lastTemplateChange: string | null; changeCount: number;
  productos: Product[]; nombres: { [key: string]: string }; descripciones: { [key: string]: string }; whatsapps: { [key: string]: string };
  subscription_status?: string; trial_start_date?: string; mp_subscription_id?: string; plan_price?: number;
};

const emptyState: ShopData = {
  email: '', nombreAdmin: '', template: 'tienda', slug: '', slugs: {}, logos: {}, nombreNegocio: '', descripcion: '', whatsapp: '', logo: '', 
  plantillaVisual: 'Minimal', personalTheme: 'glass', plan: 'none', nombreDueno: '', apellidoDueno: '', telefonoDueno: '', 
  templateLocked: null, lastTemplateChange: null, changeCount: 0, productos: [], nombres: {}, descripciones: {}, whatsapps: {},
  subscription_status: 'trial', trial_start_date: '', mp_subscription_id: '', plan_price: 0
};

const ShopContext = createContext<any>(null);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [shopData, setShopData] = useState<ShopData>(emptyState);
  const [loading, setLoading] = useState(true);

  const getTipo = (tmpl: string) => (tmpl === 'menu' ? 'gastronomia' : tmpl === 'personal' ? 'enlace' : tmpl === 'catalogo' ? 'catalogo' : 'producto');
  const getDefaults = (tmpl: string) => (tmpl === 'menu' ? DEFAULT_MENU : tmpl === 'personal' ? DEFAULT_LINKS : tmpl === 'catalogo' ? DEFAULT_CATALOGO : DEFAULT_TIENDA);

  const loadShopData = async () => {
    try {
        const { data: { user } } = await supabase.auth.getSession().then(res => res.data.session ? { data: { user: res.data.session.user } } : { data: { user: null } });
        if (!user || !user.email) { setLoading(false); return; }
        const userEmail = user.email.toLowerCase();
        let { data: shop } = await supabase.from('shops').select('*').eq('owner_id', user.id).maybeSingle();

        if (!shop) {
             let { data: shopV2 } = await supabase.from('shops').select('*').eq('user_id', user.id).maybeSingle();
             shop = shopV2;
             if (!shop) {
                const { data: newShop } = await supabase.from('shops').insert([{ user_id: user.id, owner_id: user.id, email: userEmail, slug_tienda: null, nombre_negocio: 'Mi Negocio', template: 'tienda', plan: 'none', subscription_status: 'trial', trial_start_date: new Date().toISOString() }]).select().single();
                shop = newShop;
             }
        }

        if (shop) {
          if (userEmail === ADMIN_EMAIL) { shop.plan = 'full'; shop.subscription_status = 'active'; if(shop.plan !== 'full') await supabase.from('shops').update({ plan: 'full', subscription_status: 'active' }).eq('id', shop.id); }
          if (!shop.email || shop.email !== userEmail) await supabase.from('shops').update({ email: userEmail }).eq('id', shop.id);

          let nombreFinal = shop.nombre_dueno || ''; let apellidoFinal = shop.apellido_dueno || ''; let telefonoFinal = shop.telefono_dueno || '';
          if (!nombreFinal) {
              const meta = user.user_metadata || {};
              nombreFinal = meta.first_name || meta.given_name || meta.full_name?.split(' ')[0] || '';
              apellidoFinal = meta.last_name || meta.family_name || meta.full_name?.split(' ').slice(1).join(' ') || '';
              if(nombreFinal) await supabase.from('shops').update({ nombre_dueno: nombreFinal, apellido_dueno: apellidoFinal }).eq('id', shop.id);
          }

          const tipoNecesario = getTipo(shop.template);
          let { data: items } = await supabase.from('products').select('*').eq('shop_id', shop.id).eq('tipo', tipoNecesario).order('created_at', { ascending: true });
          if (!items || items.length === 0) {
             const defaults = getDefaults(shop.template);
             const toInsert = defaults.map(p => ({ ...p, shop_id: shop.id, imagen_url: (p as any).imagen_url }));
             const { data: inserted } = await supabase.from('products').insert(toInsert).select();
             if (inserted) items = inserted;
          }

          const currentSlugs: any = { tienda: shop.slug_tienda || '', catalogo: shop.slug_catalogo || '', menu: shop.slug_menu || '', personal: shop.slug_personal || '' };
          const currentLogos: any = { tienda: shop.logo_tienda || '', catalogo: shop.logo_catalogo || '', menu: shop.logo_menu || '', personal: shop.logo_personal || '' };
          const currentNombres: any = { tienda: shop.nombre_tienda || shop.nombre_negocio, catalogo: shop.nombre_catalogo || shop.nombre_negocio, menu: shop.nombre_menu || shop.nombre_negocio, personal: shop.nombre_personal || shop.nombre_negocio };
          const currentDesc: any = { tienda: shop.descripcion_tienda || shop.descripcion, catalogo: shop.descripcion_catalogo || shop.descripcion, menu: shop.descripcion_menu || shop.descripcion, personal: shop.descripcion_personal || shop.descripcion };
          const currentWhatsapps: any = { tienda: shop.whatsapp_tienda || shop.whatsapp, catalogo: shop.whatsapp_catalogo || shop.whatsapp, menu: shop.whatsapp_menu || shop.whatsapp, personal: shop.whatsapp_personal || '' };

          setShopData({
            id: shop.id, email: userEmail, nombreAdmin: nombreFinal ? `${nombreFinal} ${apellidoFinal ? apellidoFinal.charAt(0).toUpperCase() + '.' : ''}` : (userEmail.split('@')[0]), 
            template: shop.template, slug: currentSlugs[shop.template] || '', slugs: currentSlugs,
            logos: currentLogos, logo: currentLogos[shop.template] || '',
            nombreNegocio: currentNombres[shop.template] || '', descripcion: currentDesc[shop.template] || '',
            nombres: currentNombres, descripciones: currentDesc, whatsapp: currentWhatsapps[shop.template] || '', whatsapps: currentWhatsapps,
            plantillaVisual: shop.plantilla_visual || 'Minimal', personalTheme: shop.personal_theme || 'glass', plan: shop.plan || 'none', 
            nombreDueno: nombreFinal, apellidoDueno: apellidoFinal, telefonoDueno: telefonoFinal,
            templateLocked: shop.template_locked || null, lastTemplateChange: shop.last_template_change, changeCount: shop.change_count || 0,
            productos: items?.map(p => ({ id: p.id, titulo: p.titulo, descripcion: p.descripcion, precio: p.precio, galeria: p.galeria || [], url: p.url_destino, shop_id: p.shop_id, tipo: p.tipo, imagen: p.imagen_url })) || [],
            subscription_status: shop.subscription_status || 'trial', trial_start_date: shop.trial_start_date || shop.created_at, mp_subscription_id: shop.mp_subscription_id || '', plan_price: shop.plan_price || 0
          });
        }
    } catch (error) { console.error("Error cargando tienda:", error); } finally { setLoading(false); }
  };

  useEffect(() => { loadShopData(); }, []);

  const canEdit = () => {
      if (shopData.email === ADMIN_EMAIL) return true; 
      if (shopData.subscription_status === 'active') return true;
      if (shopData.subscription_status === 'trial' && shopData.trial_start_date) {
         const days = Math.ceil(Math.abs(new Date().getTime() - new Date(shopData.trial_start_date).getTime()) / (1000 * 60 * 60 * 24));
         return days <= 14;
      }
      return false;
  };

  const activateTrial = async (selectedPlan: 'simple' | 'full', selectedTemplate?: string) => {
      if (!shopData.id) return;
      const now = new Date().toISOString();
      const updates: any = { plan: selectedPlan, subscription_status: 'trial', trial_start_date: now };
      
      // Al activar Básico, fijamos la fecha de cambio para que empiecen a correr los 30 días
      if (selectedPlan === 'simple' && selectedTemplate) { 
          updates.template = selectedTemplate; 
          updates.template_locked = selectedTemplate;
          updates.last_template_change = now; // ✅ IMPORTANTE
      } else if (selectedPlan === 'full') { 
          updates.template_locked = null; 
      }
      
      const { error } = await supabase.from('shops').update(updates).eq('id', shopData.id);
      if (!error) {
          setShopData(prev => ({ 
              ...prev, plan: selectedPlan, subscription_status: 'trial', trial_start_date: now, 
              template: (selectedPlan === 'simple' && selectedTemplate) ? selectedTemplate : prev.template, 
              templateLocked: (selectedPlan === 'simple' && selectedTemplate) ? selectedTemplate : null,
              lastTemplateChange: (selectedPlan === 'simple') ? now : prev.lastTemplateChange
          }));
          return true;
      }
      return false;
  };

  const changeTemplate = async (newTemplate: string): Promise<{success: boolean, message?: string}> => {
    if (shopData.template === newTemplate) return { success: true };

    // --- RESTRICCIÓN DE 30 DÍAS (PLAN SIMPLE) ---
    if (shopData.plan === 'simple') {
        // Si no está bloqueada, es la primera vez, dejamos pasar.
        // Pero si ya está bloqueada Y hay fecha de cambio, verificamos.
        if (shopData.templateLocked && shopData.lastTemplateChange) {
            const lastChange = new Date(shopData.lastTemplateChange);
            const now = new Date();
            
            // Calculamos diferencia en milisegundos
            const diffTime = Math.abs(now.getTime() - lastChange.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            // Si pasaron menos de 30 días, bloqueamos
            if (diffDays < 30) {
                const remaining = 30 - diffDays;
                return { success: false, message: `🔒 Plan Básico: Solo puedes cambiar de plantilla cada 30 días. Faltan ${remaining} días.` };
            }
        }
    }
    
    // Si pasa la validación:
    setShopData(prev => ({ 
        ...prev, template: newTemplate, productos: [], 
        logo: prev.logos[newTemplate] || '', slug: prev.slugs[newTemplate] || '',
        nombreNegocio: prev.nombres[newTemplate] || '', descripcion: prev.descripciones[newTemplate] || '', whatsapp: prev.whatsapps[newTemplate] || ''
    }));
    
    if (shopData.id) {
       const now = new Date().toISOString();
       const updates: any = { template: newTemplate };
       
       // Si es simple, actualizamos el bloqueo y la fecha
       if (shopData.plan === 'simple') {
           updates.template_locked = newTemplate;
           updates.last_template_change = now;
           setShopData(prev => ({ ...prev, templateLocked: newTemplate, lastTemplateChange: now }));
       }

       await supabase.from('shops').update(updates).eq('id', shopData.id);

       const tipoNecesario = getTipo(newTemplate);
       let { data: items } = await supabase.from('products').select('*').eq('shop_id', shopData.id).eq('tipo', tipoNecesario).order('created_at', { ascending: true });
       if (!items || items.length === 0) {
          const defaults = getDefaults(newTemplate);
          const toInsert = defaults.map(p => ({ ...p, shop_id: shopData.id, imagen_url: (p as any).imagen_url }));
          const { data: inserted } = await supabase.from('products').insert(toInsert).select();
          if (inserted) items = inserted;
       }
       setShopData(prev => ({ ...prev, template: newTemplate, productos: items?.map(p => ({ id: p.id, titulo: p.titulo, descripcion: p.descripcion, precio: p.precio, galeria: p.galeria || [], url: p.url_destino, shop_id: p.shop_id, tipo: p.tipo, imagen: p.imagen_url })) || [] }));
    }

    return { success: true };
  };

  const updateConfig = async (newData: any) => {
    if (!canEdit()) return;
    setShopData((prev) => {
        const updatedSlugs = { ...prev.slugs }; const updatedLogos = { ...prev.logos }; const updatedNombres = { ...prev.nombres }; const updatedDesc = { ...prev.descripciones }; const updatedWhatsapps = { ...prev.whatsapps };
        if (newData.slug !== undefined) updatedSlugs[prev.template] = newData.slug;
        if (newData.logos) Object.assign(updatedLogos, newData.logos); else if (newData.logo !== undefined) updatedLogos[prev.template] = newData.logo;
        if (newData.nombreNegocio !== undefined) updatedNombres[prev.template] = newData.nombreNegocio;
        if (newData.descripcion !== undefined) updatedDesc[prev.template] = newData.descripcion;
        if (newData.whatsapp !== undefined) updatedWhatsapps[prev.template] = newData.whatsapp;
        return { ...prev, ...newData, slugs: updatedSlugs, logos: updatedLogos, nombres: updatedNombres, descripciones: updatedDesc, whatsapps: updatedWhatsapps, logo: (newData.logo !== undefined) ? newData.logo : prev.logo };
    });
    if (shopData.id) {
        const dbData: any = { plantilla_visual: newData.plantillaVisual, personal_theme: newData.personalTheme };
        if (newData.nombreNegocio !== undefined) { if(shopData.template === 'tienda') dbData.nombre_tienda = newData.nombreNegocio; if(shopData.template === 'catalogo') dbData.nombre_catalogo = newData.nombreNegocio; if(shopData.template === 'menu') dbData.nombre_menu = newData.nombreNegocio; if(shopData.template === 'personal') dbData.nombre_personal = newData.nombreNegocio; }
        if (newData.descripcion !== undefined) { if(shopData.template === 'tienda') dbData.descripcion_tienda = newData.descripcion; if(shopData.template === 'catalogo') dbData.descripcion_catalogo = newData.descripcion; if(shopData.template === 'menu') dbData.descripcion_menu = newData.descripcion; if(shopData.template === 'personal') dbData.descripcion_personal = newData.descripcion; }
        if (newData.whatsapp !== undefined) { if(shopData.template === 'tienda') dbData.whatsapp_tienda = newData.whatsapp; if(shopData.template === 'catalogo') dbData.whatsapp_catalogo = newData.whatsapp; if(shopData.template === 'menu') dbData.whatsapp_menu = newData.whatsapp; if(shopData.template === 'personal') dbData.whatsapp_personal = newData.whatsapp; }
        if (newData.logo !== undefined) { dbData.logo_url = newData.logo; if(shopData.template === 'tienda') dbData.logo_tienda = newData.logo; if(shopData.template === 'catalogo') dbData.logo_catalogo = newData.logo; if(shopData.template === 'menu') dbData.logo_menu = newData.logo; if(shopData.template === 'personal') dbData.logo_personal = newData.logo; }
        if (newData.slug !== undefined) { if(shopData.template === 'tienda') dbData.slug_tienda = newData.slug; if(shopData.template === 'catalogo') dbData.slug_catalogo = newData.slug; if(shopData.template === 'menu') dbData.slug_menu = newData.slug; if(shopData.template === 'personal') dbData.slug_personal = newData.slug; }
        await supabase.from('shops').update(dbData).eq('id', shopData.id);
    }
  };

  const updateTemplateSlug = async (tmpl: string, newSlug: string) => { if (!canEdit() || !shopData.id) return; setShopData((prev) => { const updatedSlugs = { ...prev.slugs, [tmpl]: newSlug }; return { ...prev, slugs: updatedSlugs, slug: (prev.template === tmpl) ? newSlug : prev.slug }; }); const dbData: any = {}; if(tmpl === 'tienda') dbData.slug_tienda = newSlug; if(tmpl === 'catalogo') dbData.slug_catalogo = newSlug; if(tmpl === 'menu') dbData.slug_menu = newSlug; if(tmpl === 'personal') dbData.slug_personal = newSlug; await supabase.from('shops').update(dbData).eq('id', shopData.id); };
  const resetTemplate = async (tmplToReset: string) => { if(!shopData.id) return; setShopData(prev => { const newSlugs = { ...prev.slugs, [tmplToReset]: '' }; const newLogos = { ...prev.logos, [tmplToReset]: '' }; const newNombres = { ...prev.nombres, [tmplToReset]: 'Mi ' + tmplToReset.charAt(0).toUpperCase() + tmplToReset.slice(1) }; const newDesc = { ...prev.descripciones, [tmplToReset]: '' }; const newWa = { ...prev.whatsapps, [tmplToReset]: '' }; return { ...prev, slugs: newSlugs, logos: newLogos, nombres: newNombres, descripciones: newDesc, whatsapps: newWa }; }); const dbData: any = {}; if(tmplToReset === 'tienda') { dbData.slug_tienda = null; dbData.logo_tienda = null; dbData.nombre_tienda = null; dbData.descripcion_tienda = null; dbData.whatsapp_tienda = null; } if(tmplToReset === 'catalogo') { dbData.slug_catalogo = null; dbData.logo_catalogo = null; dbData.nombre_catalogo = null; dbData.descripcion_catalogo = null; dbData.whatsapp_catalogo = null; } if(tmplToReset === 'menu') { dbData.slug_menu = null; dbData.logo_menu = null; dbData.nombre_menu = null; dbData.descripcion_menu = null; dbData.whatsapp_menu = null; } if(tmplToReset === 'personal') { dbData.slug_personal = null; dbData.logo_personal = null; dbData.nombre_personal = null; dbData.descripcion_personal = null; dbData.whatsapp_personal = null; } await supabase.from('shops').update(dbData).eq('id', shopData.id); const tipo = getTipo(tmplToReset); await supabase.from('products').delete().eq('shop_id', shopData.id).eq('tipo', tipo); if (shopData.template === tmplToReset) changeTemplate(tmplToReset); };
  const lockTemplate = async (selectedTemplate: string) => { if(!shopData.id) return; if(confirm(`¿Confirmar "${selectedTemplate.toUpperCase()}" como única plantilla?`)) { const now = new Date().toISOString(); await supabase.from('shops').update({ template: selectedTemplate, template_locked: selectedTemplate, last_template_change: now }).eq('id', shopData.id); setShopData(prev => ({ ...prev, template: selectedTemplate, templateLocked: selectedTemplate, lastTemplateChange: now })); return true; } return false; };
  const updateProfile = async (data: any) => { setShopData(prev => { let nuevoNombre = prev.nombreAdmin; if (data.nombreDueno || data.apellidoDueno) { const n = data.nombreDueno || prev.nombreDueno; const a = data.apellidoDueno || prev.apellidoDueno; if(n) nuevoNombre = `${n} ${a ? a.charAt(0).toUpperCase() + '.' : ''}`; } return { ...prev, ...data, nombreAdmin: nuevoNombre }; }); if(shopData.id) { const dbData: any = {}; if(data.nombreDueno !== undefined) dbData.nombre_dueno = data.nombreDueno; if(data.apellidoDueno !== undefined) dbData.apellido_dueno = data.apellidoDueno; if(data.telefonoDueno !== undefined) dbData.telefono_dueno = data.telefonoDueno; if(shopData.email) dbData.email = shopData.email; if(data.plan !== undefined) { dbData.plan = data.plan; if(data.plan === 'full') dbData.template_locked = null; } const { error } = await supabase.from('shops').update(dbData).eq('id', shopData.id); if (error) console.error("Error guardando perfil:", error); } };
  const changePassword = async (p: string) => (await supabase.auth.updateUser({ password: p })).error;
  const manualSave = async () => true; 
  const addProduct = async (prod: Product) => { if (!canEdit() || !shopData.id) return; const tipoActual = getTipo(shopData.template); const { data } = await supabase.from('products').insert([{ shop_id: shopData.id, titulo: prod.titulo, descripcion: prod.descripcion, precio: prod.precio, galeria: prod.galeria || [], url_destino: prod.url, tipo: tipoActual, imagen_url: prod.imagen }]).select().single(); if (data) { setShopData((prev:any) => ({ ...prev, productos: [...prev.productos, { id: data.id, titulo: data.titulo, descripcion: data.descripcion, precio: data.precio, galeria: data.galeria || [], url: data.url_destino, shop_id: data.shop_id, tipo: data.tipo, imagen: data.imagen_url }] })); } };
  const updateProduct = async (id: string, data: Partial<Product>) => { if (!canEdit()) return; setShopData((prev:any) => ({ ...prev, productos: prev.productos.map((p:any) => (p.id === id ? { ...p, ...data } : p)) })); const dbData: any = {}; if (data.titulo !== undefined) dbData.titulo = data.titulo; if (data.descripcion !== undefined) dbData.descripcion = data.descripcion; if (data.precio !== undefined) dbData.precio = data.precio; if (data.url !== undefined) dbData.url_destino = data.url; if (data.imagen !== undefined) dbData.imagen_url = data.imagen; if (data.galeria !== undefined) dbData.galeria = data.galeria; await supabase.from('products').update(dbData).eq('id', id); };
  const deleteProduct = async (id: string) => { if (!canEdit()) return; setShopData((prev:any) => ({ ...prev, productos: prev.productos.filter((p:any) => p.id !== id) })); await supabase.from('products').delete().eq('id', id); };

  return (
    <ShopContext.Provider value={{ shopData, loading, updateConfig, changeTemplate, addProduct, updateProduct, deleteProduct, updateProfile, lockTemplate, canEdit, changePassword, manualSave, resetTemplate, updateTemplateSlug, activateTrial }}>
      {children}
    </ShopContext.Provider>
  );
};
export const useShop = () => useContext(ShopContext);