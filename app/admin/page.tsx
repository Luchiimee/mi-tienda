'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; 

import Sidebar from './../components/Sidebar'; 
import PhoneMockup from './../components/PhoneMockup';
import { useShop } from './../context/ShopContext';
import Link from 'next/link';

export default function Home() {
  const { shopData } = useShop();
  const router = useRouter();
  
  // Protección de Sesión (Esto sí lo dejamos, para que no entren desconocidos)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkUser();
  }, [router]);

  return (
    <div className="contenedor-layout">
      <Sidebar activeTab="personalizar" />

      <main className="main-content">
        
        {/* AVISO DE MODO LECTURA (Solo si no tiene plan) */}
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
                <Link href="/admin/planes" style={{marginLeft: 10, fontWeight: 'bold', color: '#856404', textDecoration: 'underline'}}>
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