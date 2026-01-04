'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar'; // O usa '../components/Sidebar' si te funciona mejor
import { useShop, Product } from '../context/ShopContext';

export default function ProductosPage() {
  const { shopData, addProduct, deleteProduct, updateProduct, changeTemplate } = useShop();
  
  // Control de menús y edición
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // --- ACCIONES ---

  // 1. Abrir/Cerrar menú de 3 puntos
  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // 2. Eliminar producto
  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar producto?')) deleteProduct(id);
  };

  // 3. Activar modo edición
  const handleEditClick = (id: string) => {
    setEditingId(id);
    setOpenMenuId(null); // Cerrar menú
  };

  // 4. Guardar cambios (Salir del modo edición)
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // 5. Crear nuevo producto y editarlo al instante
  const handleCreateNew = () => {
    const newId = Date.now().toString();
    const newProd: Product = {
        id: newId,
        titulo: 'Nuevo Producto',
        descripcion: '',
        precio: '',
        imagen: '', // Sin imagen al inicio
        url: ''
    };
    addProduct(newProd);
    setEditingId(newId); // <--- ¡Magia! Se pone en modo edición automáticamente
  };

  // 6. Actualizar datos en tiempo real (mientras escribes)
  const handleChange = (id: string, field: string, value: string) => {
    updateProduct(id, { [field]: value });
  };


  // --- BLOQUEO PLANTILLA PERSONAL ---
  if (shopData.template === 'personal') {
      return (
          <div className="contenedor-layout">
              <Sidebar activeTab="productos" />
              <main className="main-content" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', height:'100vh'}}>
                  <div style={{fontSize:'50px', marginBottom:'20px'}}>🚫</div>
                  <h2 style={{color:'#2c3e50'}}>Sección No Disponible</h2>
                  <p style={{color:'#7f8c8d', maxWidth:'400px', margin:'10px 0 30px 0'}}>La plantilla <strong>Personal</strong> usa enlaces directos, no productos. Edítalos en "Personalizar".</p>
                  <Link href="/" style={{textDecoration:'none'}}><button style={{background:'#3498db', color:'white', border:'none', padding:'12px 25px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>🔙 Volver a Personalizar</button></Link>
                  <p style={{marginTop:'30px', fontSize:'13px', color:'#bdc3c7'}}>¿Quieres vender? <span onClick={() => { if(confirm('Cambiar a Tienda?')) changeTemplate('tienda'); }} style={{color:'#3498db', cursor:'pointer', fontWeight:'bold'}}>Cambiar a Tienda</span></p>
              </main>
          </div>
      );
  }

  // --- VISTA DE GESTIÓN ---
  return (
    <div className="contenedor-layout">
      <Sidebar activeTab="productos" />

      <main className="main-content" style={{alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: '30px'}}>
        
        <div className="encabezado-contenido" style={{width: '100%', marginBottom: '30px'}}>
            <h2 style={{fontSize:'24px', color:'#2c3e50'}}>Gestionar Productos</h2>
            <p style={{color:'#7f8c8d'}}>Haz clic en una tarjeta para editar su contenido.</p>
        </div>

        <div className="container-cards-grid" style={{width: '100%'}}>
            
            {shopData.productos.map((prod: Product) => {
                const isEditing = editingId === prod.id;

                return (
                    <div key={prod.id} className={`product-card-pro ${isEditing ? 'editing' : ''}`}>
                        
                        {/* === ZONA SUPERIOR: IMAGEN === */}
                        <div className="card-image-header">
                             {/* SI ESTÁ EDITANDO: Mostramos el campo para pegar URL */}
                             {isEditing ? (
                                 <div className="img-edit-overlay">
                                     <label>URL de la Imagen</label>
                                     <input 
                                        type="text" 
                                        value={prod.imagen} 
                                        placeholder="Pegar https://..." 
                                        onChange={(e) => handleChange(prod.id, 'imagen', e.target.value)}
                                        autoFocus
                                     />
                                 </div>
                             ) : (
                                 /* SI NO ESTÁ EDITANDO: Mostramos la imagen */
                                 prod.imagen ? <img src={prod.imagen} alt={prod.titulo} /> : <div className="no-image-placeholder">📷</div>
                             )}

                             {/* Botón de 3 puntos (Solo visible si NO se edita) */}
                             {!isEditing && (
                                 <div className="menu-dots-container">
                                     <button className="menu-dots-btn" onClick={(e) => toggleMenu(prod.id, e)}>⋮</button>
                                     {openMenuId === prod.id && (
                                         <div className="dropdown-menu">
                                             <div className="dropdown-item" onClick={() => handleEditClick(prod.id)}>✏️ Editar</div>
                                             <div className="dropdown-item delete" onClick={() => handleDelete(prod.id)}>🗑️ Eliminar</div>
                                         </div>
                                     )}
                                 </div>
                             )}
                        </div>
                        
                        {/* === ZONA INFERIOR: TEXTOS === */}
                        <div className="card-body-pro">
                            
                            {/* TÍTULO */}
                            {isEditing ? (
                                <input 
                                    className="input-inline titulo" 
                                    value={prod.titulo} 
                                    onChange={(e) => handleChange(prod.id, 'titulo', e.target.value)} 
                                    placeholder="Nombre del producto"
                                />
                            ) : (
                                <h3>{prod.titulo}</h3>
                            )}

                            {/* DESCRIPCIÓN */}
                            {isEditing ? (
                                <textarea 
                                    className="input-inline desc" 
                                    value={prod.descripcion} 
                                    onChange={(e) => handleChange(prod.id, 'descripcion', e.target.value)} 
                                    placeholder="Descripción corta..."
                                />
                            ) : (
                                <p className="desc">{prod.descripcion || 'Sin descripción'}</p>
                            )}

                            {/* PRECIO */}
                            {isEditing ? (
                                <div style={{display:'flex', alignItems:'center', gap:5}}>
                                    <span style={{fontWeight:'bold', color:'#2c3e50'}}>$</span>
                                    <input 
                                        className="input-inline precio" 
                                        value={prod.precio} 
                                        onChange={(e) => handleChange(prod.id, 'precio', e.target.value)} 
                                        placeholder="0"
                                    />
                                </div>
                            ) : (
                                <p className="precio">${prod.precio}</p>
                            )}

                            {/* BOTÓN GUARDAR (Solo en edición) */}
                            {isEditing && (
                                <button className="btn-save-floating" onClick={handleSave}>
                                    ✔ Guardar
                                </button>
                            )}

                        </div>
                    </div>
                );
            })}

            {/* === TARJETA AGREGAR === */}
            <div className="add-card-pro" onClick={handleCreateNew}>
                <div className="add-icon">+</div>
                <h3>Agregar nuevo</h3>
                <p>Crear producto</p>
            </div>

        </div>

      </main>
    </div>
  );
}