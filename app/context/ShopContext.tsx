'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// ⚠️ TU EMAIL DE SUPER ADMIN (Para darte acceso total)
const ADMIN_EMAIL = 'luchiimee2@gmail.com'; 

// Definición de tipos
export interface Product {
  id: string;
  titulo: string;
  descripcion: string;
  precio: string;
  imagen: string;
  galeria: string[];
  url?: string;
  tipo?: string; 
}

interface ShopData {
  id: string;
  email: string; // Agregamos email aquí
  slug: string;
  slugs: { [key: string]: string }; 
  template: string;
  templateLocked: string | null; 
  nombreNegocio: string;
  descripcion: string;
  whatsapp: string;
  logo: string;
  logos: { [key: string]: string }; 
  personalTheme: string; 
  productos: Product[];
  
  // Datos del dueño
  nombreAdmin: string; 
  nombreDueno: string;
  apellidoDueno: string;
  telefonoDueno: string; // Nuevo campo

  // Suscripción
  plan: 'none' | 'simple' | 'full';
  subscription_status: 'trial' | 'active' | 'cancelled' | 'past_due';
  trial_start_date: string | null;
  mp_subscription_id: string | null;
  
  created_at?: string;
}

interface ShopContextType {
  shopData: ShopData;
  loading: boolean;
  updateConfig: (newData: Partial<ShopData>) => void;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => void;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  changeTemplate: (newTemplate: string) => void;
  updateTemplateSlug: (template: string, newSlug: string) => Promise<void>;
  updateProfile: (data: { nombreDueno?: string; apellidoDueno?: string; telefonoDueno?: string }) => Promise<void>;
  changePassword: (newPass: string) => Promise<any>;
  resetTemplate: (template: string) => Promise<void>;
  lockTemplate: (template: string) => Promise<void>; 
  activateTrial: (plan: 'simple' | 'full', template?: string) => Promise<boolean>;
  manualSave: () => Promise<void>;
  canEdit: () => boolean; 
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [shopData, setShopData] = useState<ShopData>({
    id: '',
    email: '',
    slug: '',
    slugs: {},
    template: 'tienda', 
    templateLocked: null,
    nombreNegocio: '',
    descripcion: '',
    whatsapp: '',
    logo: '',
    logos: {},
    personalTheme: 'minimal',
    productos: [],
    nombreAdmin: '', 
    nombreDueno: '',
    apellidoDueno: '',
    telefonoDueno: '',
    plan: 'none',
    subscription_status: 'trial',
    trial_start_date: null,
    mp_subscription_id: null
  });

  // Cargar datos al inicio
  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const userEmail = session.user.email;
      let { data: shop, error } = await supabase
        .from('shops')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Si no existe tienda, crearla
        const { data: newShop, error: createError } = await supabase
          .from('shops')
          .insert([{ 
              user_id: session.user.id, 
              email: userEmail, // Guardamos el email al crear
              slug: `tienda-${Date.now()}`,
              config: {},
              products: [],
              plan: 'none',
              subscription_status: 'trial',
              trial_start_date: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        shop = newShop;
      }

      // --- LÓGICA DE SUPER ADMIN (MODO DIOS) ---
      // Si eres tú, te damos todo FULL y ACTIVO automáticamente en el estado local
      if (userEmail === ADMIN_EMAIL) {
          console.log("👑 Modo Super Admin activado para:", userEmail);
          shop.plan = 'full';
          shop.subscription_status = 'active';
      }

      // Parsear datos
      const currentConfig = shop.config || {};
      const currentProducts = shop.products || [];
      const currentSlugs = shop.slugs || {}; 
      const currentLogos = shop.logos || {};

      // Detectar slug actual según la plantilla
      const activeSlug = currentSlugs[currentConfig.template || 'tienda'] || shop.slug;

      setShopData({
        id: shop.id,
        email: userEmail || '', // Aseguramos que esté en el estado
        slug: activeSlug,
        slugs: currentSlugs,
        template: currentConfig.template || 'tienda',
        templateLocked: shop.template_locked || null,
        nombreNegocio: currentConfig.nombreNegocio || '',
        descripcion: currentConfig.descripcion || '',
        whatsapp: currentConfig.whatsapp || '',
        logo: currentConfig.logo || '',
        logos: currentLogos,
        personalTheme: currentConfig.personalTheme || 'minimal',
        productos: currentProducts,
        nombreAdmin: shop.nombre_dueno || session.user.email?.split('@')[0] || 'Usuario',
        nombreDueno: shop.nombre_dueno || '',
        apellidoDueno: shop.apellido_dueno || '',
        telefonoDueno: shop.telefono_dueno || '', // Cargamos el teléfono
        plan: shop.plan || 'none',
        subscription_status: shop.subscription_status || 'trial',
        trial_start_date: shop.trial_start_date,
        mp_subscription_id: shop.mp_subscription_id
      });

      // Asegurar que el email esté guardado en la tabla pública (para el Super Admin Panel)
      if (!shop.email && userEmail) {
          await supabase.from('shops').update({ email: userEmail }).eq('id', shop.id);
      }

    } catch (error: any) {
      console.error('Error cargando tienda:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Función de Guardado Manual ---
  const manualSave = async () => {
    try {
      const configToSave = {
        template: shopData.template,
        nombreNegocio: shopData.nombreNegocio,
        descripcion: shopData.descripcion,
        whatsapp: shopData.whatsapp,
        logo: shopData.logo,
        personalTheme: shopData.personalTheme
      };

      const { error } = await supabase
        .from('shops')
        .update({ 
            config: configToSave,
            products: shopData.productos,
            logos: shopData.logos // Guardamos mapa de logos
        })
        .eq('id', shopData.id);

      if (error) throw error;
      console.log('✅ Guardado exitoso');
    } catch (error: any) {
      console.error('Error guardando:', error.message);
      alert('Error al guardar cambios');
    }
  };

  // Guardado automático con debounce (opcional, dejamos el manual como principal si prefieres)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (shopData.id) manualSave(); 
    }, 2000);
    return () => clearTimeout(timer);
  }, [shopData.template, shopData.nombreNegocio, shopData.descripcion, shopData.whatsapp, shopData.logo, shopData.productos, shopData.personalTheme]);

  // Actualizar config local
  const updateConfig = (newData: Partial<ShopData>) => {
    setShopData(prev => {
        // Si cambia el logo, lo guardamos en el mapa de logos específico
        let newLogos = { ...prev.logos };
        if (newData.logo) {
            newLogos[prev.template] = newData.logo;
        }

        return { ...prev, ...newData, logos: newLogos };
    });
  };

  // Gestión de Productos
  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setShopData(prev => ({
      ...prev,
      productos: prev.productos.map(p => p.id === id ? { ...p, ...updatedProduct } : p)
    }));
  };

  const addProduct = async (product: Product) => {
    // Asignar el tipo según la plantilla actual al crear
    let tipo = 'producto';
    if(shopData.template === 'menu') tipo = 'gastronomia';
    if(shopData.template === 'personal') tipo = 'enlace';
    if(shopData.template === 'catalogo') tipo = 'catalogo';

    const newProd = { ...product, tipo };
    
    setShopData(prev => ({
      ...prev,
      productos: [...prev.productos, newProd]
    }));
  };

  const deleteProduct = async (id: string) => {
    setShopData(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.id !== id)
    }));
  };

  // --- Cambio de Plantilla (Con lógica de slugs y logos) ---
  const changeTemplate = (newTemplate: string) => {
      // Recuperar el slug guardado para esta plantilla
      const savedSlug = shopData.slugs[newTemplate]; 
      
      // Recuperar logo guardado
      const savedLogo = shopData.logos[newTemplate] || '';

      setShopData(prev => ({
          ...prev,
          template: newTemplate,
          slug: savedSlug || prev.slug, // Si no tiene, mantiene el actual temporalmente
          logo: savedLogo
      }));
  };

  const updateTemplateSlug = async (template: string, newSlug: string) => {
      // Guardar en la BD el slug específico para esa plantilla
      const newSlugs = { ...shopData.slugs, [template]: newSlug };
      
      const { error } = await supabase
          .from('shops')
          .update({ slugs: newSlugs })
          .eq('id', shopData.id);

      if(!error) {
          setShopData(prev => ({
              ...prev,
              slugs: newSlugs,
              slug: template === prev.template ? newSlug : prev.slug
          }));
      }
  };

  // --- Actualizar Perfil del Dueño (AHORA CON TELÉFONO Y EMAIL) ---
  const updateProfile = async (data: { nombreDueno?: string; apellidoDueno?: string; telefonoDueno?: string }) => {
      const updates: any = {};
      if (data.nombreDueno !== undefined) updates.nombre_dueno = data.nombreDueno;
      if (data.apellidoDueno !== undefined) updates.apellido_dueno = data.apellidoDueno;
      
      // ⚠️ AQUÍ ESTÁ LA MAGIA DEL TELÉFONO:
      if (data.telefonoDueno !== undefined) updates.telefono_dueno = data.telefonoDueno;

      // Aseguramos también el email por si acaso
      if (shopData.email) updates.email = shopData.email;

      const { error } = await supabase
          .from('shops')
          .update(updates)
          .eq('id', shopData.id);

      if (!error) {
          setShopData(prev => ({ 
              ...prev, 
              ...data,
              nombreAdmin: data.nombreDueno || prev.nombreAdmin 
          }));
      }
  };
  
  const changePassword = async (newPass: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      return error;
  };

  // Resetea una plantilla a "estado de fábrica" (quita su slug)
  const resetTemplate = async (tmpl: string) => {
      const newSlugs = { ...shopData.slugs };
      delete newSlugs[tmpl];

      await supabase.from('shops').update({ slugs: newSlugs }).eq('id', shopData.id);
      setShopData(prev => ({ ...prev, slugs: newSlugs }));
  };

  const lockTemplate = async (template: string) => {
      await supabase.from('shops').update({ template_locked: template }).eq('id', shopData.id);
      setShopData(prev => ({ ...prev, templateLocked: template }));
  };

  const activateTrial = async (plan: 'simple' | 'full', template?: string) => {
      const updates: any = { 
          plan, 
          subscription_status: 'trial', // Ojo: Si eres Admin, esto se sobrescribe al cargar
          trial_start_date: new Date().toISOString()
      };
      
      if (plan === 'simple' && template) {
          updates.template_locked = template;
          updates.template = template; // Forzamos cambio visual
      } else if (plan === 'full') {
          updates.template_locked = null; // Liberamos
      }

      const { error } = await supabase.from('shops').update(updates).eq('id', shopData.id);
      
      if (!error) {
          // Actualizamos local
          setShopData(prev => ({
             ...prev,
             plan,
             subscription_status: 'trial',
             templateLocked: updates.template_locked || null,
             template: updates.template || prev.template
          }));
          return true;
      }
      return false;
  };

  // --- PERMISOS (Bloqueo de edición) ---
  const canEdit = () => {
      // 👑 MODO DIOS: Si eres tú, siempre TRUE
      if (shopData.email === ADMIN_EMAIL) return true;

      // Resto de mortales
      if (shopData.subscription_status === 'active') return true;
      
      // Lógica de Trial (14 días)
      if (shopData.subscription_status === 'trial' && shopData.trial_start_date) {
          const start = new Date(shopData.trial_start_date);
          const now = new Date();
          const diffDays = Math.ceil(Math.abs(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 14; 
      }
      
      return false; // Ni activo ni trial válido
  };

  return (
    <ShopContext.Provider value={{ 
        shopData, loading, updateConfig, updateProduct, addProduct, deleteProduct, changeTemplate, 
        updateTemplateSlug, updateProfile, changePassword, resetTemplate, lockTemplate, activateTrial, manualSave, canEdit 
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop debe usarse dentro de un ShopProvider');
  }
  return context;
}