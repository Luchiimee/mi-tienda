'use client';

import { Key, useState, useEffect } from 'react';
import { useShop, Product } from '../context/ShopContext';
import Sidebar from '../components/Sidebar';
import { supabase } from '@/lib/supabaseClient';

export default function ProductosPage() {
  const { shopData, addProduct, updateProduct, deleteProduct } = useShop();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Inicializamos formData siempre con valores seguros
  const [formData, setFormData] = useState<Partial<Product>>({ galeria: [], titulo: '', descripcion: '', precio: '', url: '' });
  
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // --- LÓGICA NUEVA PARA CORREGIR EL ERROR DE CARGA (INVISIBLE VISUALMENTE) ---
  const [productsList, setProductsList] = useState<Product[]>([]);

  const cleanGallery = (galeriaRaw: any) => {
      if (!galeriaRaw) return [];
      if (Array.isArray(galeriaRaw)) return galeriaRaw;
      if (typeof galeriaRaw === 'string') {
          try { return JSON.parse(galeriaRaw); } catch (error) { return []; }
      }
      return [];
  };

  useEffect(() => {
      if (shopData.productos) {
          const cleaned = shopData.productos.map((prod: any) => ({
              ...prod,
              galeria: cleanGallery(prod.galeria)
          }));
          setProductsList(cleaned);
      }
  }, [shopData.productos]);
  // -----------------------------------------------------------------------------

  const handleOpenEditor = (product?: Product) => {
      if (product) {
          // Detectamos si hay galería, si no, usamos la imagen legacy
          const safeGallery = (product.galeria && Array.isArray(product.galeria) && product.galeria.length > 0)
              ? product.galeria 
              : (product.imagen ? [product.imagen] : []);

          setFormData({ 
              ...product, 
              galeria: safeGallery,
              imagen: safeGallery[0] || '' 
          });
          setEditingId(product.id);
          setIsCreating(false);
      } else {
          setEditingId(null);
          setIsCreating(true);
          setFormData({ titulo: '', descripcion: '', precio: '', galeria: [], url: '', imagen: '' });
      }
  };

  const handleClose = () => {
      setEditingId(null);
      setIsCreating(false);
      setFormData({ galeria: [], titulo: '', descripcion: '', precio: '', url: '', imagen: '' });
  };

  const handleChange = (e: any) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
      if (!formData.titulo) return alert("El título es obligatorio");
      
      const productToSave = {
          ...formData,
          // Aseguramos que la imagen principal sea siempre la primera de la galería
          imagen: formData.galeria && formData.galeria.length > 0 ? formData.galeria[0] : ''
      };

      if (isCreating) {
          await addProduct(productToSave as Product);
      } else if (editingId) {
          await updateProduct(editingId, productToSave);
      }
      handleClose();
  };

  const handleDelete = async (id: string) => {
      if (confirm("¿Estás seguro de borrar este producto?")) await deleteProduct(id);
  };

  const handleImageUpload = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
          const fileName = `prod-${Date.now()}.${file.name.split('.').pop()}`;
          const { error } = await supabase.storage.from('products').upload(fileName, file);
          if (error) throw error;

          const { data } = supabase.storage.from('products').getPublicUrl(fileName);
          const newUrl = data.publicUrl;

          // Lógica segura para acumular imágenes
          const currentGallery = Array.isArray(formData.galeria) ? [...formData.galeria] : [];
          const newGallery = [...currentGallery, newUrl];
          
          setFormData((prev: any) => ({ 
              ...prev, 
              galeria: newGallery, 
              imagen: newGallery[0] // Actualizamos portada
          }));

      } catch (error: any) {
          alert("Error: " + error.message);
      } finally {
          setUploading(false);
      }
  };

  const removeImage = (indexToRemove: number) => {
      const currentGallery = Array.isArray(formData.galeria) ? formData.galeria : [];
      const newGallery = currentGallery.filter((_: string, idx: number) => idx !== indexToRemove);
      
      setFormData((prev: any) => ({ 
          ...prev, 
          galeria: newGallery, 
          imagen: newGallery.length > 0 ? newGallery[0] : '' 
      }));
  };

  const handleDragStart = (idx: number) => setDraggedIndex(idx);
  const handleDragOver = (e: any) => e.preventDefault();
  const handleDrop = (targetIndex: number) => {
      if (draggedIndex === null || draggedIndex === targetIndex) return;
      
      const currentGallery = Array.isArray(formData.galeria) ? [...formData.galeria] : [];
      const itemToMove = currentGallery[draggedIndex];
      
      currentGallery.splice(draggedIndex, 1);
      currentGallery.splice(targetIndex, 0, itemToMove);
      
      setFormData({
          ...formData,
          galeria: currentGallery,
          imagen: currentGallery[0] 
      });
      setDraggedIndex(null);
  };

  const getTipo = (tmpl: string) => {
      if (tmpl === 'menu') return 'gastronomia';
      if (tmpl === 'personal') return 'enlace';
      if (tmpl === 'catalogo') return 'catalogo';
      return 'producto';
  };
  const tipoActual = getTipo(shopData.template);
  
  // USAMOS LA LISTA LIMPIA (productsList) EN LUGAR DE shopData DIRECTO
  const productosVisibles = productsList.filter(p => p.tipo === tipoActual);

  return (
    <div className="contenedor-layout" style={{display:'flex'}}>
      <Sidebar activeTab="productos" />

      <main className="main-content" style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh', display:'flex', flexDirection:'column', justifyContent:'flex-start', flex:1 }}>
        
        <div style={{ marginBottom: 30 }}>
            <h1 style={{ margin: 0, color: '#1e293b', fontSize: 28, fontWeight: '800' }}>Mis Productos</h1>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 14 }}>Gestionando: <b>{shopData.template.toUpperCase()}</b></p>
        </div>

        {/* --- MODO LISTA (GRILLA ORIGINAL) --- */}
        {!isCreating && !editingId && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, width: '100%' }}>
                
                {productosVisibles.map((p: Product) => (
                    <div key={p.id} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', transition: 'transform 0.2s', display:'flex', flexDirection:'column' }}>
                        
                        {/* PORTADA PRINCIPAL */}
                        <div style={{ height: 180, background: '#f1f5f9', position: 'relative' }}>
                            {(p.galeria?.[0] || p.imagen) ? (
                                <img src={p.galeria?.[0] || p.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', fontSize: 30 }}>📷</div>
                            )}
                            {p.precio && <div style={{ position: 'absolute', bottom: 5, right: 5, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>${p.precio}</div>}
                        </div>

                        {/* MINIATURAS EN LISTA (RECUPERADO) */}
                        {p.galeria && p.galeria.length > 1 && (
                            <div style={{ display: 'flex', gap: 4, padding: '8px 12px 0 12px', overflowX:'hidden' }}>
                                {p.galeria.slice(1, 4).map((img: string | undefined, i: number) => (
                                    <div key={i} style={{width: 30, height: 30, borderRadius: 4, overflow:'hidden', border:'1px solid #eee', flexShrink:0}}>
                                        <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                    </div>
                                ))}
                                {p.galeria.length > 4 && (
                                    <div style={{width: 30, height: 30, borderRadius: 4, background:'#f1f5f9', color:'#64748b', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>
                                        +{p.galeria.length - 4}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ padding: 12, flex: 1, display:'flex', flexDirection:'column' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: 15, color: '#334155' }}>{p.titulo}</h3>
                            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom:'auto' }}>{p.descripcion || 'Sin descripción'}</p>
                            
                            <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
                                <button onClick={() => handleOpenEditor(p)} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', background: 'white', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold', color: '#475569' }}>Editar</button>
                                <button onClick={() => handleDelete(p.id)} style={{ padding: '8px 12px', border: '1px solid #fca5a5', background: '#fef2f2', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#dc2626' }}>🗑️</button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* BOTÓN AGREGAR (ESTILO ORIGINAL) */}
                <button 
                    onClick={() => handleOpenEditor()} 
                    style={{ 
                        minHeight: '280px', borderRadius: 12, border: '2px dashed #cbd5e1', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', gap: 10, transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                    <div style={{ fontSize: 40, background: '#eff6ff', color: '#2563eb', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
                    <div style={{ fontSize: 14, fontWeight: 'bold', color: '#334155' }}>Agregar Nuevo</div>
                </button>

            </div>
        )}

        {/* --- MODO EDITOR (MODAL FLOTANTE ORIGINAL) --- */}
        {(isCreating || editingId) && (
            <div key={editingId || 'new'} style={{ maxWidth: 600, margin: '0 auto', background: 'white', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: 30, position: 'relative', width:'100%' }}>
                <button onClick={handleClose} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
                
                <h2 style={{ marginTop: 0, marginBottom: 25, color: '#1e293b' }}>{isCreating ? 'Nuevo Producto' : 'Editar Producto'}</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    
                    {/* EDITOR DE IMÁGENES */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 10 }}>Galería de Fotos (Arrastra para ordenar)</label>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 15, marginBottom: 15 }}>
                            {(() => {
                                const gallery = Array.isArray(formData.galeria) ? formData.galeria : [];
                                
                                return gallery.map((img: string, idx: number) => (
                                    <div 
                                        key={idx}
                                        draggable
                                        onDragStart={() => handleDragStart(idx)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(idx)}
                                        style={{ 
                                            aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', position: 'relative', 
                                            border: idx === 0 ? '3px solid #2563eb' : '1px solid #e2e8f0', cursor: 'grab', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button onClick={() => removeImage(idx)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>×</button>
                                        {idx === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: '#2563eb', color: 'white', fontSize: 10, textAlign: 'center', fontWeight: 'bold', padding: '4px 0' }}>⭐ PORTADA</div>}
                                    </div>
                                ));
                            })()}

                            <label style={{ aspectRatio: '1/1', border: '2px dashed #cbd5e1', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', gap: 5, background: uploading ? '#f1f5f9' : 'transparent', transition: 'all 0.2s' }}>
                                <span style={{ fontSize: 24 }}>{uploading ? '⏳' : '+'}</span>
                                <span style={{ fontSize: 11, fontWeight: 'bold' }}>{uploading ? 'Subiendo' : 'Agregar'}</span>
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    {shopData.template !== 'personal' ? (
                        <>
                            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 5 }}>Nombre</label><input type="text" name="titulo" value={formData.titulo || ''} onChange={handleChange} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
                            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 5 }}>Descripción</label><textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', minHeight: 80 }} /></div>
                            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 5 }}>Precio</label><input type="number" name="precio" value={formData.precio || ''} onChange={handleChange} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
                        </>
                    ) : (
                        <>
                            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 5 }}>Texto del Botón</label><input type="text" name="titulo" value={formData.titulo || ''} onChange={handleChange} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
                            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 5 }}>URL de Destino</label><input type="text" name="url" value={formData.url || ''} onChange={handleChange} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
                        </>
                    )}

                    <button onClick={handleSave} style={{ marginTop: 10, width: '100%', padding: 15, background: '#10b981', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>{isCreating ? 'Crear Producto' : 'Guardar Cambios'}</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}