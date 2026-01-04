'use client';

// 1. IMPORTS NUEVOS (AGRÉGALOS AQUÍ ARRIBA)
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; 

// Tus imports originales
import Sidebar from './../components/Sidebar'; 
import PhoneMockup from './../components/PhoneMockup';
import { useShop } from './../context/ShopContext';

export default function Home() {
  const { shopData } = useShop();
  
  // 2. INICIALIZAR EL ROUTER
  const router = useRouter();

  // 3. LA PROTECCIÓN (SI NO HAY USUARIO, TE MANDA AL LOGIN)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login'); // <--- Patea al usuario fuera si no está logueado
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="contenedor-layout">
      {/* Aquí está la clave: pasamos activeTab="personalizar".
          Esto le dice a la Sidebar que muestre los acordeones de edición.
      */}
      <Sidebar activeTab="personalizar" />

      <main className="main-content">
        <div style={{ textAlign: 'center', color: '#95a5a6', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>Vista Previa en Vivo</h3>
          <p style={{ fontSize: '14px', marginTop: '5px' }}>
              Modo: <strong style={{textTransform:'capitalize'}}>{shopData.template}</strong>
          </p>
        </div>

        {/* CORREGIDO: Borramos "data={shopData}" */}
        <PhoneMockup />
      </main>
    </div>
  );
}