'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const ADMIN_EMAIL = 'luchiimee2@gmail.com'.toLowerCase();

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

  // Variable calculada para saber si es Admin
  const isSuperAdmin = shopData.email === ADMIN_EMAIL;

  const getTipo = (tmpl: string) => (tmpl === 'menu' ? 'gastronomia' : tmpl === 'personal' ? 'enlace' : tmpl === 'catalogo' ? 'catalogo' : 'producto');
  const getDefaults = (tmpl: string) => (tmpl === 'menu' ? DEFAULT_MENU : tmpl === 'personal' ? DEFAULT_LINKS : tmpl === 'catalogo' ? DEFAULT_CATALOGO : DEFAULT_TIENDA);

  const loadShopData = useCallback(async (userParam?: any) => {
    try {
        let user = userParam;
        if (!user) {
            const { data } = await supabase.auth.getUser();
            user = data.user;
        }

        if (!user || !user.email) { setLoading(false); return; }
        
        const userEmail = user.email.toLowerCase();
        
        // 1. Asegurar usuario
        try { await supabase.from('users').upsert({ id: user.id, email: userEmail }, { onConflict: 'id' }); } catch (e) { console.warn("Upsert user ignored"); }

        // 2. Buscar tienda
        let { data: shop } = await supabase.from('shops').select('*').eq('owner_id', user.id).maybeSingle();

        // 3. Crear tienda si no existe
        if (!shop) {
             console.log("🆕 Creando tienda...");
             const insertData = { owner_id: user.id, email: userEmail, nombre_negocio: 'Mi Negocio', template: 'tienda', plan: 'none', subscription_status: 'none', trial_start_date: new Date().toISOString() };
             const { data: newShop, error } = await supabase.from('shops').insert([insertData]).select().single();
             if (error) { console.error("Error creating shop:", error); setLoading(false); return; }
             shop = newShop;
        }

        if (shop) {
          // Lógica Admin
          if (userEmail === ADMIN_EMAIL) { 
              shop.plan = 'full'; 
              shop.subscription_status = 'active'; 
          }
          if (!shop.email || shop.email !== userEmail) supabase.from('shops').update({ email: userEmail }).eq('id', shop.id).then();

          // Sincro perfil
          let nombreFinal = shop.nombre_dueno || ''; 
          let apellidoFinal = shop.apellido_dueno || ''; 
          let telefonoFinal = shop.telefono_dueno || '';

          if (!nombreFinal) {
              const meta = user.user_metadata || {};
              nombreFinal = meta.nombre || meta.first_name || (meta.full_name ? meta.full_name.split(' ')[0] : '') || userEmail.split('@')[0];
              apellidoFinal = meta.apellido || meta.last_name || '';
              if(nombreFinal && !shop.nombre_dueno) await supabase.from('shops').update({ nombre_dueno: nombreFinal, apellido_dueno: apellidoFinal }).eq('id', shop.id);
          }

          // PRODUCTOS
          const currentTemplate = shop.template || 'tienda';
          const tipoNecesario = getTipo(currentTemplate);
          let items: any[] = [];
          
          const { data: dbItems } = await supabase.from('products').select('*').eq('shop_id', shop.id).eq('tipo', tipoNecesario).order('created_at', { ascending: true });
          
          if (dbItems && dbItems.length > 0) {
              items = dbItems;
          } else {
             // INSERTAR DEFAULTS SI NO EXISTEN
             console.log("⚠️ No hay productos, insertando defaults...");
             const defaults = getDefaults(currentTemplate);
             const toInsert = defaults.map(p => ({ ...p, shop_id: shop.id, imagen_url: (p as any).imagen_url }));
             
             const { data: inserted, error: insertError } = await supabase.from('products').insert(toInsert).select();
             
             if (insertError) {
                 console.error("Error insertando defaults:", insertError);
                 // Fallback visual por si falla la DB
                 items = defaults.map((p, i) => ({ ...p, id: `local-${i}`, shop_id: shop.id }));
             } else {
                 items = inserted;
             }
          }

          // Mapeo
          const currentSlugs: any = { tienda: shop.slug_tienda || '', catalogo: shop.slug_catalogo || '', menu: shop.slug_menu || '', personal: shop.slug_personal || '' };
          const currentLogos: any = { tienda: shop.logo_tienda || '', catalogo: shop.logo_catalogo || '', menu: shop.logo_menu || '', personal: shop.logo_personal || '' };
          const currentNombres: any = { tienda: shop.nombre_tienda || shop.nombre_negocio, catalogo: shop.nombre_catalogo || shop.nombre_negocio, menu: shop.nombre_menu || shop.nombre_negocio, personal: shop.nombre_personal || shop.nombre_negocio };
          const currentDesc: any = { tienda: shop.descripcion_tienda || shop.descripcion, catalogo: shop.descripcion_catalogo || shop.descripcion, menu: shop.descripcion_menu || shop.descripcion, personal: shop.descripcion_personal || shop.descripcion };
          const currentWhatsapps: any = { tienda: shop.whatsapp_tienda || shop.whatsapp, catalogo: shop.whatsapp_catalogo || shop.whatsapp, menu: shop.whatsapp_menu || shop.whatsapp, personal: shop.whatsapp_personal || '' };

          setShopData({
            id: shop.id, email: userEmail, nombreAdmin: (userEmail.split('@')[0]), 
            template: currentTemplate, slug: currentSlugs[currentTemplate] || '', slugs: currentSlugs,
            logos: currentLogos, logo: currentLogos[currentTemplate] || '',
            nombreNegocio: currentNombres[currentTemplate] || '', descripcion: currentDesc[currentTemplate] || '',
            nombres: currentNombres, descripciones: currentDesc, whatsapp: currentWhatsapps[currentTemplate] || '', whatsapps: currentWhatsapps,
            plantillaVisual: shop.plantilla_visual || 'Minimal', personalTheme: shop.personal_theme || 'glass', 
            plan: shop.plan || 'none', 
            nombreDueno: nombreFinal, apellidoDueno: apellidoFinal, telefonoDueno: telefonoFinal,
            templateLocked: shop.template_locked || null, lastTemplateChange: shop.last_template_change, changeCount: shop.change_count || 0,
            productos: items.map(p => ({ id: p.id, titulo: p.titulo, descripcion: p.descripcion, precio: p.precio, galeria: p.galeria || [], url: p.url_destino, shop_id: p.shop_id, tipo: p.tipo, imagen: p.imagen_url })),
            subscription_status: shop.subscription_status || 'none', trial_start_date: shop.trial_start_date, mp_subscription_id: shop.mp_subscription_id, plan_price: shop.plan_price
          });
        }
    } catch (error) { console.error("Error LoadShopData:", error); } finally { setLoading(false); }
  }, []);

  useEffect(() => { 
      const initLoad = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) await loadShopData(session.user);
          else setLoading(false);
      };
      initLoad();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
              if (session?.user) await loadShopData(session.user);
          } else if (event === 'SIGNED_OUT') {
              setShopData(emptyState);
              setLoading(false);
          }
      });

      return () => { subscription.unsubscribe(); };
  }, [loadShopData]);

  // Resto de funciones auxiliares...
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
      if (!shopData.id) return alert("Cargando...");
      const now = new Date().toISOString();
      let nextCount = shopData.changeCount || 0;
      
      if (shopData.plan === 'simple' && selectedPlan === 'simple' && selectedTemplate && selectedTemplate !== shopData.templateLocked) {
          if (nextCount >= 1 && shopData.lastTemplateChange) {
             const diff = Math.ceil(Math.abs(new Date().getTime() - new Date(shopData.lastTemplateChange).getTime()) / (86400000));
             if (diff < 30) return alert(`🔒 Cambio bloqueado. Espera ${30 - diff} días.`), false;
             nextCount = 0; 
          }
          nextCount += 1;
      }
      if (shopData.plan !== 'simple' && selectedPlan === 'simple') nextCount = 0;

      const updates: any = { plan: selectedPlan, subscription_status: 'trial', trial_start_date: now };
      
      let newSlug = "";
      if (selectedPlan === 'simple' && selectedTemplate) { 
          updates.template = selectedTemplate; updates.template_locked = selectedTemplate;
          updates.last_template_change = now; updates.change_count = nextCount;
          if (!shopData.slugs[selectedTemplate]) {
              const baseName = (shopData.nombreNegocio || 'mi-negocio').toLowerCase().replace(/[^a-z0-9]/g, '-');
              newSlug = `${baseName}-${Math.floor(Math.random() * 1000)}`;
              if(selectedTemplate === 'tienda') updates.slug_tienda = newSlug;
              if(selectedTemplate === 'catalogo') updates.slug_catalogo = newSlug;
              if(selectedTemplate === 'menu') updates.slug_menu = newSlug;
              if(selectedTemplate === 'personal') updates.slug_personal = newSlug;
          }
      } else if (selectedPlan === 'full') { updates.template_locked = null; }
      
      const { data: updatedShop, error } = await supabase.from('shops').update(updates).eq('id', shopData.id).select().single();
      
      if (error || !updatedShop) { alert(`Error DB: ${error?.message}`); return false; }
      
      setShopData(prev => {
          const currentSlugs: any = { tienda: updatedShop.slug_tienda || '', catalogo: updatedShop.slug_catalogo || '', menu: updatedShop.slug_menu || '', personal: updatedShop.slug_personal || '' };
          return { 
              ...prev, 
              plan: updatedShop.plan, subscription_status: updatedShop.subscription_status, trial_start_date: updatedShop.trial_start_date, 
              template: updatedShop.template, templateLocked: updatedShop.template_locked,
              lastTemplateChange: updatedShop.last_template_change, changeCount: updatedShop.change_count || 0,
              slugs: currentSlugs, slug: currentSlugs[updatedShop.template]
          };
      });

      if (selectedPlan === 'simple' && selectedTemplate && selectedTemplate !== shopData.template) {
           await changeTemplate(selectedTemplate); 
      }
      return true;
  };

  const changeTemplate = async (newTemplate: string) => {
    if (shopData.template === newTemplate) return { success: true };
    setShopData(prev => ({ ...prev, template: newTemplate, productos: [] })); 
    if (shopData.id) {
       await supabase.from('shops').update({ template: newTemplate }).eq('id', shopData.id);
       const tipo = getTipo(newTemplate);
       let items: any[] = [];
       const { data } = await supabase.from('products').select('*').eq('shop_id', shopData.id).eq('tipo', tipo).order('created_at', { ascending: true });
       if (!data || data.length === 0) {
          const defs = getDefaults(newTemplate).map((p, i) => ({ ...p, shop_id: shopData.id, imagen_url: (p as any).imagen_url }));
          const { data: ins } = await supabase.from('products').insert(defs).select();
          items = ins || defs.map((p, i) => ({...p, id: `loc-${i}`}));
       } else items = data;
       setShopData(prev => ({ ...prev, template: newTemplate, productos: items.map(p => ({ id: p.id, titulo: p.titulo, descripcion: p.descripcion, precio: p.precio, galeria: p.galeria || [], url: p.url_destino, shop_id: p.shop_id, tipo: p.tipo, imagen: p.imagen_url })) }));
    }
    return { success: true };
  };

  const updateConfig = async (newData: any) => { if (!canEdit()) return; setShopData((prev) => { const updatedSlugs = { ...prev.slugs }; if (newData.slug !== undefined) updatedSlugs[prev.template] = newData.slug; return { ...prev, ...newData, slugs: updatedSlugs }; }); if (shopData.id) { const dbData: any = { plantilla_visual: newData.plantillaVisual, personal_theme: newData.personalTheme }; if (newData.nombreNegocio !== undefined) { if(shopData.template === 'tienda') dbData.nombre_tienda = newData.nombreNegocio; if(shopData.template === 'catalogo') dbData.nombre_catalogo = newData.nombreNegocio; if(shopData.template === 'menu') dbData.nombre_menu = newData.nombreNegocio; if(shopData.template === 'personal') dbData.nombre_personal = newData.nombreNegocio; } if (newData.descripcion !== undefined) { if(shopData.template === 'tienda') dbData.descripcion_tienda = newData.descripcion; if(shopData.template === 'catalogo') dbData.descripcion_catalogo = newData.descripcion; if(shopData.template === 'menu') dbData.descripcion_menu = newData.descripcion; if(shopData.template === 'personal') dbData.descripcion_personal = newData.descripcion; } if (newData.whatsapp !== undefined) { if(shopData.template === 'tienda') dbData.whatsapp_tienda = newData.whatsapp; if(shopData.template === 'catalogo') dbData.whatsapp_catalogo = newData.whatsapp; if(shopData.template === 'menu') dbData.whatsapp_menu = newData.whatsapp; if(shopData.template === 'personal') dbData.whatsapp_personal = newData.whatsapp; } if (newData.logo !== undefined) { dbData.logo_url = newData.logo; if(shopData.template === 'tienda') dbData.logo_tienda = newData.logo; if(shopData.template === 'catalogo') dbData.logo_catalogo = newData.logo; if(shopData.template === 'menu') dbData.logo_menu = newData.logo; if(shopData.template === 'personal') dbData.logo_personal = newData.logo; } if (newData.slug !== undefined) { if(shopData.template === 'tienda') dbData.slug_tienda = newData.slug; if(shopData.template === 'catalogo') dbData.slug_catalogo = newData.slug; if(shopData.template === 'menu') dbData.slug_menu = newData.slug; if(shopData.template === 'personal') dbData.slug_personal = newData.slug; } await supabase.from('shops').update(dbData).eq('id', shopData.id); } };
  const updateTemplateSlug = async (tmpl: string, newSlug: string) => { if (!canEdit() || !shopData.id) return; setShopData((prev) => { const updatedSlugs = { ...prev.slugs, [tmpl]: newSlug }; return { ...prev, slugs: updatedSlugs, slug: (prev.template === tmpl) ? newSlug : prev.slug }; }); const dbData: any = {}; if(tmpl === 'tienda') dbData.slug_tienda = newSlug; if(tmpl === 'catalogo') dbData.slug_catalogo = newSlug; if(tmpl === 'menu') dbData.slug_menu = newSlug; if(tmpl === 'personal') dbData.slug_personal = newSlug; await supabase.from('shops').update(dbData).eq('id', shopData.id); };
  const resetTemplate = async (tmplToReset: string) => { if(!shopData.id) return; setShopData(prev => ({ ...prev, slugs: { ...prev.slugs, [tmplToReset]: '' } })); const dbData: any = {}; if(tmplToReset === 'tienda') { dbData.slug_tienda = null; dbData.logo_tienda = null; dbData.nombre_tienda = null; dbData.descripcion_tienda = null; dbData.whatsapp_tienda = null; } if(tmplToReset === 'catalogo') { dbData.slug_catalogo = null; dbData.logo_catalogo = null; dbData.nombre_catalogo = null; dbData.descripcion_catalogo = null; dbData.whatsapp_catalogo = null; } if(tmplToReset === 'menu') { dbData.slug_menu = null; dbData.logo_menu = null; dbData.nombre_menu = null; dbData.descripcion_menu = null; dbData.whatsapp_menu = null; } if(tmplToReset === 'personal') { dbData.slug_personal = null; dbData.logo_personal = null; dbData.nombre_personal = null; dbData.descripcion_personal = null; dbData.whatsapp_personal = null; } await supabase.from('shops').update(dbData).eq('id', shopData.id); const tipo = getTipo(tmplToReset); await supabase.from('products').delete().eq('shop_id', shopData.id).eq('tipo', tipo); if (shopData.template === tmplToReset) changeTemplate(tmplToReset); };
  const lockTemplate = async (selectedTemplate: string) => { if(!shopData.id) return; if(confirm(`¿Confirmar "${selectedTemplate.toUpperCase()}" como única plantilla?`)) { const now = new Date().toISOString(); await supabase.from('shops').update({ template: selectedTemplate, template_locked: selectedTemplate, last_template_change: now }).eq('id', shopData.id); setShopData(prev => ({ ...prev, template: selectedTemplate, templateLocked: selectedTemplate, lastTemplateChange: now })); return true; } return false; };
  const updateProfile = async (data: any) => { setShopData(prev => ({ ...prev, ...data })); if(shopData.id) { const dbData: any = {}; if(data.nombreDueno) dbData.nombre_dueno = data.nombreDueno; if(data.apellidoDueno) dbData.apellido_dueno = data.apellidoDueno; if(data.telefonoDueno) dbData.telefono_dueno = data.telefonoDueno; if(shopData.email) dbData.email = shopData.email; if(data.plan) { dbData.plan = data.plan; if(data.plan === 'full') dbData.template_locked = null; } await supabase.from('shops').update(dbData).eq('id', shopData.id); } };
  const changePassword = async (p: string) => (await supabase.auth.updateUser({ password: p })).error;
  const manualSave = async () => true; 
  const addProduct = async (prod: Product) => { if (!canEdit() || !shopData.id) return; const tipoActual = getTipo(shopData.template); const { data } = await supabase.from('products').insert([{ shop_id: shopData.id, titulo: prod.titulo, descripcion: prod.descripcion, precio: prod.precio, galeria: prod.galeria || [], url_destino: prod.url, tipo: tipoActual, imagen_url: prod.imagen }]).select().single(); if (data) { setShopData((prev:any) => ({ ...prev, productos: [...prev.productos, { id: data.id, titulo: data.titulo, descripcion: data.descripcion, precio: data.precio, galeria: data.galeria || [], url: data.url_destino, shop_id: data.shop_id, tipo: data.tipo, imagen: data.imagen_url }] })); } };
  const updateProduct = async (id: string, data: Partial<Product>) => { if (!canEdit()) return; setShopData((prev:any) => ({ ...prev, productos: prev.productos.map((p:any) => (p.id === id ? { ...p, ...data } : p)) })); const dbData: any = {}; if (data.titulo !== undefined) dbData.titulo = data.titulo; if (data.descripcion !== undefined) dbData.descripcion = data.descripcion; if (data.precio !== undefined) dbData.precio = data.precio; if (data.url !== undefined) dbData.url_destino = data.url; if (data.imagen !== undefined) dbData.imagen_url = data.imagen; if (data.galeria !== undefined) dbData.galeria = data.galeria; await supabase.from('products').update(dbData).eq('id', id); };
  const deleteProduct = async (id: string) => { if (!canEdit()) return; setShopData((prev:any) => ({ ...prev, productos: prev.productos.filter((p:any) => p.id !== id) })); await supabase.from('products').delete().eq('id', id); };

  // EXPORTAMOS reloadShopData Y isSuperAdmin
  return (
    <ShopContext.Provider value={{ shopData, loading, reloadShopData: () => supabase.auth.getSession().then(({data}) => data.session && loadShopData(data.session.user)), isSuperAdmin, updateConfig, changeTemplate, addProduct, updateProduct, deleteProduct, updateProfile, lockTemplate, canEdit, changePassword, manualSave, resetTemplate, updateTemplateSlug, activateTrial }}>
      {children}
    </ShopContext.Provider>
  );
};
export const useShop = () => useContext(ShopContext);