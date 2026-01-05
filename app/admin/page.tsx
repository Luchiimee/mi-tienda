'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; 

import Sidebar from './../components/Sidebar'; 
import PhoneMockup from './../components/PhoneMockup';
import { useShop } from './../context/ShopContext';

export default function Home() {
  const { shopData } = useShop();
  const router = useRouter();
  
  // Protección
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkUser();
  }, [router]);

  return (
    <div className="contenedor-layout">
      {/* El Sidebar ahora tiene TODA la magia adentro */}
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