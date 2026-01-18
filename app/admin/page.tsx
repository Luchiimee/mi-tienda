'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; 

import Sidebar from './../components/Sidebar'; 
import PhoneMockup from './../components/PhoneMockup';
import { useShop } from './../context/ShopContext';
import Link from 'next/link';

export default function Home() {
  // 1. IMPORTANTE: Traemos 'loading' del contexto
  const { shopData, loading } = useShop();
  const router = useRouter();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkUser();
  }, [router]);

  // 2. PANTALLA DE CARGA (Para evitar que muestre el cartel amarillo antes de tiempo)
  if (loading) {
      return (
        <div className="contenedor-layout" style={{display:'flex', height:'100vh'}}>
           <Sidebar activeTab="personalizar" />
           <main className="main-content" style={{display:'flex', justifyContent:'center', alignItems:'center', flex:1}}>
               <div style={{color:'#64748b'}}>⚡ Cargando tu tienda...</div>
           </main>
        </div>
      );
  }

  return (
    <div className="contenedor-layout">
      <Sidebar activeTab="personalizar" />

      <main className="main-content">
        
        {/* AVISO DE MODO LECTURA (Solo si YA cargó y el plan sigue siendo none) */}
        {shopData.plan === 'none' && (
            <div style={{
                background: '#fff3cd', 
                color: '#856404', 
                padding: '10px', 
                textAlign: 'center', 
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ffeeba',
                fontSize: '14px'
            }}>
                👀 <strong>Modo Vista Previa:</strong> Estás viendo el panel en modo demostración. 
                <Link href="/configuracion" style={{marginLeft: 10, fontWeight: 'bold', color: '#856404', textDecoration: 'underline'}}>
                    Activar un Plan para Editar
                </Link>
            </div>
        )}

        <div style={{ textAlign: 'center', color: '#95a5a6', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>Vista Previa en Vivo</h3>
          <p style={{ fontSize: '14px', marginTop: '5px' }}>
              Modo: <strong style={{textTransform:'capitalize'}}>{shopData.template}</strong>
          </p>
        </div>

        <PhoneMockup />
      </main>
    </div>
  );
}