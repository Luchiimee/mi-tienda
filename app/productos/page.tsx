'use client';

import { useShop } from '../context/ShopContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const { shopData, deleteProduct, canEdit } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  // Usamos un estado local para asegurar que los datos estén limpios antes de mostrar
  const [productsList, setProductsList] = useState<any[]>([]);
  const router = useRouter();

  // --- 1. TRADUCTOR AUTOMÁTICO DE GALERÍA ---
  // Esta función se asegura de que la galería sea SIEMPRE una lista, nunca texto
  const cleanGallery = (galeriaRaw: any) => {
      if (!galeriaRaw) return [];
      if (Array.isArray(galeriaRaw)) return galeriaRaw; // Ya es lista, perfecto
      if (typeof galeriaRaw === 'string') {
          try {
              // Si es texto "['foto.jpg']", lo convertimos a lista real
              return JSON.parse(galeriaRaw);
          } catch (error) {
              return [];
          }
      }
      return [];
  };

  // --- 2. EFECTO DE LIMPIEZA ---
  // Se ejecuta cada vez que entras a la página o cambian los datos
  useEffect(() => {
      if (shopData.productos) {
          const cleaned = shopData.productos.map((prod: any) => ({
              ...prod,
              // Aquí aplicamos la limpieza a cada producto
              galeria: cleanGallery(prod.galeria)
          }));
          setProductsList(cleaned);
      }
  }, [shopData.productos]);

  const filteredProducts = productsList.filter((p: any) => 
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
      if(!canEdit()) {
          alert("Debes configurar tu plan primero.");
          return;
      }
      if(confirm('¿Seguro que quieres eliminar este producto?')) {
          await deleteProduct(id);
      }
  };

  if (!shopData.id) return <div style={{padding:20}}>Cargando...</div>;

  return (
    <div className="admin-container">
      <header style={{ marginBottom: 30, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>📦 Mis Productos</h1>
            <p style={{ color: '#7f8c8d', fontSize: 14 }}>Gestiona el inventario de tu {shopData.template}</p>
        </div>
        <Link href="/admin" style={{ textDecoration:'none', color:'#3498db', fontWeight:'bold' }}>← Volver al Editor</Link>
      </header>

      <div style={{ marginBottom: 20, display:'flex', gap:10 }}>
        <input 
          type="text" 
          placeholder="Buscar producto..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
        
        {/* CARD DE AGREGAR NUEVO */}
        <div 
            onClick={() => router.push('/admin')}
            style={{ 
                border: '2px dashed #ddd', borderRadius: 12, display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', minHeight: 300, cursor: 'pointer', color: '#95a5a6',
                backgroundColor: '#f9f9f9'
            }}
        >
            <span style={{ fontSize: 40 }}>+</span>
            <span style={{ fontWeight: 'bold' }}>Agregar desde Sidebar</span>
        </div>

        {/* LISTADO DE PRODUCTOS */}
        {filteredProducts.map((prod: any) => {
            // Lógica visual de imágenes
            const galleryImages = prod.galeria || [];
            
            // La imagen principal es la primera de la galería O la imagen suelta O un placeholder
            const mainImage = galleryImages.length > 0 ? galleryImages[0] : (prod.imagen || '');
            
            // Las miniaturas son desde la segunda imagen en adelante (máximo 3)
            const smallImages = galleryImages.slice(1, 4); 

            return (
                <div key={prod.id} style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position:'relative' }}>
                    
                    {/* IMAGEN PORTADA (GRANDE) */}
                    <div style={{ height: 200, width: '100%', backgroundColor: '#ecf0f1', position: 'relative' }}>
                        {mainImage ? (
                            <img src={mainImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>📷</div>
                        )}
                        <div style={{position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.6)', color:'white', padding:'2px 8px', borderRadius:10, fontSize:10}}>
                            {galleryImages.length > 0 ? `${galleryImages.length} fotos` : '1 foto'}
                        </div>
                    </div>

                    {/* MINIATURAS (ABAJO) */}
                    {smallImages.length > 0 ? (
                        <div style={{ display: 'flex', gap: 2, padding: 2, background: '#f0f0f0' }}>
                            {smallImages.map((img: string, idx: number) => (
                                <div key={idx} style={{ flex: 1, height: 40, overflow: 'hidden' }}>
                                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                            {galleryImages.length > 4 && (
                                <div style={{ flex: 1, height: 40, background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#666' }}>
                                    +{galleryImages.length - 4}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Si no hay más fotos, dejamos un espacio vacío pequeño o nada
                        <div style={{ height: 5, background: '#f0f0f0' }}></div>
                    )}

                    <div style={{ padding: 15 }}>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: 16, fontWeight: 'bold' }}>{prod.titulo}</h3>
                        <p style={{ margin: 0, color: '#7f8c8d', fontSize: 12, height: 32, overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.descripcion}</p>
                        <div style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#27ae60' }}>${prod.precio}</span>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(prod.id);
                                }}
                                style={{ background: '#fee2e2', color: '#e74c3c', border: 'none', width: 30, height: 30, borderRadius: 6, cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}