'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; 

import Sidebar from './../components/Sidebar'; 
import PhoneMockup from './../components/PhoneMockup';
// Importamos el nuevo componente selector (ajusta la ruta si lo pusiste en otro lado)
import PlanSelector from './../components/PlanSelector'; 
import { useShop } from './../context/ShopContext';

export default function Home() {
  const { shopData } = useShop();
  const router = useRouter();
  
  // Protección de Sesión
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkUser();
  }, [router]);

  // --- 🔒 BLOQUEO POR FALTA DE PLAN ---
  // Si el usuario se acaba de registrar y su plan es 'none', 
  // mostramos el Selector de Planes y ocultamos todo lo demás.
  if (shopData.plan === 'none') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#f4f4f5',
        fontFamily: 'sans-serif'
      }}>
         <PlanSelector />
      </div>
    );
  }

  // --- ✅ DASHBOARD NORMAL (Solo si ya eligió plan) ---
  return (
    <div className="contenedor-layout">
      {/* El Sidebar contiene la navegación y herramientas */}
      <Sidebar activeTab="personalizar" />

      <main className="main-content">
        <div style={{ textAlign: 'center', color: '#95a5a6', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>Vista Previa en Vivo</h3>
          <p style={{ fontSize: '14px', marginTop: '5px' }}>
              Modo: <strong style={{textTransform:'capitalize'}}>{shopData.template}</strong>
          </p>
        </div>

        {/* Mockup Centrado y Limpio */}
        <PhoneMockup />
      </main>
    </div>
  );
}