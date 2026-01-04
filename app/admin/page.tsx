'use client';

// Asegúrate de usar las rutas correctas (./ o @/)
import Sidebar from './../components/Sidebar'; 
import PhoneMockup from './../components/PhoneMockup';
import { useShop } from './../context/ShopContext';

export default function Home() {
  const { shopData } = useShop();

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