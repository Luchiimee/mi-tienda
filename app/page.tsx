'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: '#ffffff', width: '100%', overflowX: 'hidden' }}>
      
      {/* --- ESTILOS PARA ANIMACIONES (CSS-in-JS simple) --- */}
      <style jsx global>{`
        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
        }
        .plan-card {
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .plan-card:hover {
          transform: scale(1.02);
          border-color: #3498db;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .floating {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: '24px', fontWeight: '800', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 10 }}>
           <div style={{background: 'linear-gradient(135deg, #f1c40f, #f39c12)', color:'white', width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>⚡</div>
           Snappy
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link href="/auth">
             <button style={{ background: 'transparent', border: 'none', fontWeight: '600', color: '#555', cursor: 'pointer', fontSize:14 }}>Ingresar</button>
          </Link>
          <Link href="/auth?mode=signup">
            <button style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '50px', fontWeight: '600', cursor: 'pointer', transition:'0.2s' }}>
              Crear Cuenta
            </button>
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center', 
          padding: '40px 5%', maxWidth: '1200px', margin: '0 auto', gap: '50px' 
      }}>
        
        {/* TEXTO HERO */}
        <div style={{textAlign: 'left'}}>
           <span style={{background:'#e3f2fd', color:'#3498db', padding:'5px 15px', borderRadius:20, fontSize:12, fontWeight:'bold', letterSpacing:1}}>POTENCIA TU SHOWROOM</span>
           
           <h1 style={{ fontSize: 'clamp(40px, 5vw, 60px)', lineHeight: '1.1', margin: '20px 0', color: '#1a252f', fontWeight:900 }}>
             Tu Catálogo Digital <br/>
             <span style={{color:'#3498db'}}>Simple y Rápido.</span>
           </h1>
           
           <p style={{ fontSize: '18px', color: '#7f8c8d', lineHeight: '1.6', marginBottom: '30px', maxWidth:'500px' }}>
             La herramienta perfecta para <b>emprendedores</b> que venden por Instagram y WhatsApp. Olvídate de Tienda Nube o Shopify. Sube tus fotos y vende al instante.
           </p>
           
           <div style={{display:'flex', gap:15, flexWrap:'wrap'}}>
              <Link href="/auth?mode=signup">
                <button style={{ padding: '15px 40px', fontSize: '16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold', boxShadow:'0 10px 20px rgba(52, 152, 219, 0.3)' }}>
                  Prueba Gratis (14 Días)
                </button>
              </Link>
           </div>
           
           <div style={{marginTop:30, display:'flex', gap:20, fontSize:12, color:'#999'}}>
               <span>✓ Sin comisiones</span>
               <span>✓ Directo a WhatsApp</span>
           </div>
        </div>

        {/* --- CELULAR MOCKUP (Tuyo) --- */}
        <div className="floating" style={{ display:'flex', justifyContent:'center', position:'relative', paddingBottom: 50 }}>
           <div style={{position:'absolute', width:'100%', height:'100%', background:'radial-gradient(circle, rgba(52,152,219,0.15) 0%, rgba(255,255,255,0) 70%)', top:'50%', left:'50%', transform:'translate(-50%, -50%)', zIndex:0}}></div>
           <div style={{
               width: 320, height: 650, background: 'white', borderRadius: 45, border: '12px solid #2c3e50',
               position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow:'hidden',
               display: 'flex', flexDirection: 'column'
           }}>
               <div style={{position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:120, height:25, background:'#2c3e50', borderBottomLeftRadius:18, borderBottomRightRadius:18, zIndex:10}}></div>
               <div style={{flex:1, overflowY:'auto', padding:'40px 15px 20px 15px', fontFamily:'sans-serif', scrollbarWidth:'none'}}>
                   <div style={{textAlign:'center', marginBottom:20}}>
                       <div style={{
                           width:70, height:70, background:'#eee', borderRadius:'50%', margin:'0 auto 10px', 
                           overflow: 'hidden', border:'1px solid #ddd'
                       }}>
                          <img src="/tienda-logo.jpg" alt="Logo" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                       </div>
                       <h3 style={{margin:0, color:'#333', fontSize:18}}>Urban Style 🔥</h3>
                       <p style={{margin:'5px 0 0 0', color:'#888', fontSize:12}}>La mejor moda urbana al mejor precio.</p>
                   </div>
                   <div style={{background:'#f5f5f5', padding:'10px 15px', borderRadius:8, color:'#999', fontSize:13, marginBottom:20, border:'1px solid #eee'}}>
                       🔍 Buscar productos...
                   </div>
                   <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                       <div style={{border:'1px solid #eee', borderRadius:8, overflow:'hidden', paddingBottom:10}}>
                           <div style={{height:160, background:'#f0f0f0'}}><img src="/ropa1.jpg" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Ropa" /></div>
                           <div style={{padding:'8px 8px 0 8px'}}><div style={{fontSize:13, fontWeight:'bold', color:'#333', marginBottom:4}}>Remera Oversize</div><div style={{fontSize:14, color:'#27ae60', fontWeight:'bold'}}>$18.500</div><button style={{width:'100%', marginTop:8, background:'#333', color:'white', border:'none', borderRadius:4, padding:'6px', fontSize:11}}>Agregar</button></div>
                       </div>
                       <div style={{border:'1px solid #eee', borderRadius:8, overflow:'hidden', paddingBottom:10}}>
                           <div style={{height:160, background:'#f0f0f0'}}><img src="/ropa2.jpg" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Ropa" /></div>
                           <div style={{padding:'8px 8px 0 8px'}}><div style={{fontSize:13, fontWeight:'bold', color:'#333', marginBottom:4}}>Jean Mom Fit</div><div style={{fontSize:14, color:'#27ae60', fontWeight:'bold'}}>$42.000</div><button style={{width:'100%', marginTop:8, background:'#333', color:'white', border:'none', borderRadius:4, padding:'6px', fontSize:11}}>Agregar</button></div>
                       </div>
                   </div>
                   <div style={{marginTop:30, textAlign:'center', paddingTop:20, borderTop:'1px solid #eee'}}>
                       <p style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', margin: '15px 0 0 0', textTransform:'uppercase', letterSpacing:1 }}>Hecha con Snappy 🚀</p>
                   </div>
               </div>
               <div style={{position:'absolute', bottom:5, left:'50%', transform:'translateX(-50%)', width:100, height:4, background:'#ddd', borderRadius:5}}></div>
           </div>
        </div>
      </header>

      {/* --- SECCIÓN PLANTILLAS REALES (ANIMADAS) --- */}
      <section style={{ padding: '80px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Diseños Profesionales</span>
            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#1e293b', marginTop: '15px' }}>Elige tu estilo</h2>
            <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '600px', margin: '15px auto 0' }}>Plantillas optimizadas para vender más en Instagram.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
            
            {/* 1. TIENDA ONLINE */}
            <div className="hover-card" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9' }}>
               <div style={{ height: '250px', background: '#e2e8f0', position:'relative', overflow:'hidden' }}>
                  {/* Aquí iría tu captura real */}
                  <img src="/plantilla-tienda.png" alt="Tienda Mockup" style={{width:'100%', height:'100%', objectFit:'cover', objectPosition:'top'}} />
                  <div style={{position:'absolute', top:15, right:15, background:'#3b82f6', color:'white', padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:'bold'}}>SHOWROOMS</div>
               </div>
               <div style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>🛍️ Tienda Online</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight:'1.5' }}>La opción clásica. Carrito de compras, categorías y checkout directo a WhatsApp.</p>
               </div>
            </div>

            {/* 2. CATÁLOGO */}
            <div className="hover-card" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9' }}>
               <div style={{ height: '250px', background: '#e2e8f0', position:'relative', overflow:'hidden' }}>
                  <img src="/plantilla-catalogo.png" alt="Catalogo Mockup" style={{width:'100%', height:'100%', objectFit:'cover', objectPosition:'top'}} />
                  <div style={{position:'absolute', top:15, right:15, background:'#8b5cf6', color:'white', padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:'bold'}}>CATALOGO</div>
               </div>
               <div style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>📒 Catálogo Digital</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight:'1.5' }}>Ideal para consultar stock o precios. Muestra tus productos de forma ordenada.</p>
               </div>
            </div>

            {/* 3. MENÚ */}
            <div className="hover-card" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9' }}>
               <div style={{ height: '250px', background: '#e2e8f0', position:'relative', overflow:'hidden' }}>
                  <img src="/plantilla-menu.png" alt="Menu Mockup" style={{width:'100%', height:'100%', objectFit:'cover', objectPosition:'top'}} />
                  <div style={{position:'absolute', top:15, right:15, background:'#f59e0b', color:'white', padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:'bold'}}>GASTRONOMÍA</div>
               </div>
               <div style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>🍔 Menú </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight:'1.5' }}>Para delivery. Tus clientes eligen sus gustos y te envían el pedido listo.</p>
               </div>
            </div>

            {/* 4. PERSONAL */}
            <div className="hover-card" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9' }}>
               <div style={{ height: '250px', background: '#e2e8f0', position:'relative', overflow:'hidden' }}>
                  <img src="/plantilla-personal.png" alt="Personal Mockup" style={{width:'100%', height:'100%', objectFit:'cover', objectPosition:'top'}} />
                  <div style={{position:'absolute', top:15, right:15, background:'#ec4899', color:'white', padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:'bold'}}>SERVICIOS</div>
               </div>
               <div style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>🪪 Bio Link</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight:'1.5' }}>Unifica tus redes, contacto y portafolio en un solo link profesional.</p>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECCIÓN PLANES (NUEVA) --- */}
      <section style={{ padding: '80px 20px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ background: '#dcfce7', color: '#166534', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: 1 }}>PRECIOS TRANSPARENTES</span>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#1e293b', margin: '20px 0 50px' }}>Invierte en tu negocio</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
            
            {/* PLAN BÁSICO */}
            <div className="plan-card" style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '24px', padding: '40px 30px', textAlign: 'left' }}>
               <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#334155' }}>Plan Básico</h3>
               <div style={{ fontSize: '40px', fontWeight: '900', color: '#3b82f6', margin: '15px 0' }}>
                 $15.200<span style={{fontSize:16, color:'#94a3b8', fontWeight:'normal'}}>/mes</span>
               </div>
               <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>Perfecto para empezar a vender.</p>
               <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display:'flex', flexDirection:'column', gap:15 }}>
                 <li style={{display:'flex', alignItems:'center', gap:10, fontSize:14, color:'#334155'}}>✅ 1 Plantilla Activa</li>
                 <li style={{display:'flex', alignItems:'center', gap:10, fontSize:14, color:'#334155'}}>✅ Productos Ilimitados</li>
                 <li style={{display:'flex', alignItems:'center', gap:10, fontSize:14, color:'#334155'}}>✅ Sin comisiones</li>
                 <li style={{display:'flex', alignItems:'center', gap:10, fontSize:14, color:'#94a3b8'}}>🔒 Cambio de diseño mensual</li>
               </ul>
               <Link href="/auth?mode=signup">
                 <button style={{ width: '100%', padding: '15px', background: 'white', color: '#3b82f6', border: '2px solid #3b82f6', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                   Comenzar Prueba Gratis
                 </button>
               </Link>
            </div>

            {/* PLAN FULL */}
            <div className="plan-card" style={{ background: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '24px', padding: '50px 30px', textAlign: 'left', position: 'relative', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.1)' }}>
               <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', background: '#3b82f6', color: 'white', padding: '5px 15px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' }}>MÁS ELEGIDO 👑</div>
               <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a' }}>Plan Full</h3>
               <div style={{ fontSize: '40px', fontWeight: '900', color: '#2563eb', margin: '15px 0' }}>
                 $20.100<span style={{fontSize:16, color:'#64748b', fontWeight:'normal'}}>/mes</span>
               </div>
               <p style={{ color: '#475569', fontSize: '14px', marginBottom: '30px' }}>Para negocios que quieren todo.</p>
               <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display:'flex', flexDirection:'column', gap:15 }}>
                 <li style={{display:'flex', alignItems:'center', gap:10, fontSize:14, color:'#1e3a8a', fontWeight:'bold'}}>🚀 Todas las plantillas activas</li>
                 <li style={{display:'flex', alignItems:'center', gap:10, fontSize:14, color:'#334155'}}>✅ Múltiples Links (Tienda + Bio)</li>
                 <li style={{display:'flex', alignItems:'center', gap:10, fontSize:14, color:'#334155'}}>✅ Soporte Prioritario</li>
                 <li style={{display:'flex', alignItems:'center', gap:10, fontSize:14, color:'#334155'}}>✅ Cambios ilimitados</li>
               </ul>
               <Link href="/auth?mode=signup">
                 <button style={{ width: '100%', padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)' }}>
                   Empezar con TODO
                 </button>
               </Link>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECCIÓN CÓMO FUNCIONA --- */}
      <section style={{ padding: '80px 5%', background: '#f8fafc' }}>
          <div style={{maxWidth:1200, margin:'0 auto', textAlign:'center'}}>
              <h2 style={{fontSize:30, color:'#2c3e50', marginBottom:50}}>¿Cómo empiezo?</h2>
              
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:40}}>
                  <div className="hover-card" style={{background:'white', padding:30, borderRadius:15, boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
                      <div style={{fontSize:40, marginBottom:15}}>🎨</div>
                      <h3 style={{marginBottom:10, color:'#2c3e50'}}>1. Crea tu cuenta</h3>
                      <p style={{color:'#7f8c8d', fontSize:14}}>Regístrate gratis y elige la plantilla que más te guste.</p>
                  </div>
                  <div className="hover-card" style={{background:'white', padding:30, borderRadius:15, boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
                      <div style={{fontSize:40, marginBottom:15}}>📦</div>
                      <h3 style={{marginBottom:10, color:'#2c3e50'}}>2. Sube tus fotos</h3>
                      <p style={{color:'#7f8c8d', fontSize:14}}>Carga tus productos, precios y descripción fácil desde el celular.</p>
                  </div>
                  <div className="hover-card" style={{background:'white', padding:30, borderRadius:15, boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
                      <div style={{fontSize:40, marginBottom:15}}>🔗</div>
                      <h3 style={{marginBottom:10, color:'#2c3e50'}}>3. ¡A Vender!</h3>
                      <p style={{color:'#7f8c8d', fontSize:14}}>Pega tu link en la bio de Instagram y recibe pedidos por WhatsApp.</p>
                  </div>
              </div>
          </div>
      </section>
      {/* --- SECCIÓN FLUJO DE COMPRA (CLIENTE) --- */}
      <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#2c3e50', marginBottom: '60px' }}>
            Así de fácil compran tus clientes
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            
            {/* PASO 1 */}
            <div className="hover-card" style={{ background: 'white', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
               <div style={{ width: 80, height: 80, background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '35px', margin: '0 auto 20px' }}>
                 👀
               </div>
               <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '15px' }}>1. Ven tu catálogo</h3>
               <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>
                 Ingresan a tu link desde Instagram o redes. Ven tus fotos y precios actualizados al instante.
               </p>
            </div>

            {/* PASO 2 */}
            <div className="hover-card" style={{ background: 'white', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
               <div style={{ width: 80, height: 80, background: '#fef9c3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '35px', margin: '0 auto 20px' }}>
                 🛒
               </div>
               <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '15px' }}>2. Llenan el carrito</h3>
               <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>
                 Eligen productos, talles o gustos y los suman al carrito. Sin registros molestos.
               </p>
            </div>

            {/* PASO 3 (DESTACADO) */}
            <div className="hover-card" style={{ background: 'white', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '2px solid #22c55e', position: 'relative' }}>
               {/* ETIQUETA FLOTANTE */}
               <div style={{ position: 'absolute', top: -15, right: 20, background: '#22c55e', color: 'white', padding: '5px 15px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', boxShadow: '0 4px 6px rgba(34, 197, 94, 0.3)' }}>
                 ¡SIN COMISIÓN!
               </div>
               
               <div style={{ width: 80, height: 80, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '35px', margin: '0 auto 20px' }}>
                 📲
               </div>
               <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '15px' }}>3. Te llega a WhatsApp</h3>
               <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>
                 El cliente toca "Enviar" y recibes el detalle completo en tu chat para coordinar el pago y envío.
               </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section style={{ padding: '80px 20px', textAlign: 'center', background: '#2c3e50', color: 'white' }}>
          <h2 style={{fontSize:35, marginBottom:20}}>Empieza tu negocio hoy</h2>
          <Link href="/auth?mode=signup">
            <button style={{ padding: '18px 50px', fontSize: '18px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight:'bold', boxShadow:'0 10px 20px rgba(0,0,0,0.2)' }}>
              Crear mi Tienda Gratis
            </button>
          </Link>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ background: '#1e293b', color: 'white', padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <span>🚀</span> Snappy
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '40px', flexWrap:'wrap' }}>
          <Link href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Términos</Link>
          <Link href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacidad</Link>
          <Link href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contacto</Link>
          <Link href="/auth" style={{ color: '#94a3b8', textDecoration: 'none' }}>Login</Link>
        </div>
        <p style={{ color: '#475569', fontSize: '14px' }}>© {new Date().getFullYear()} Snappy Inc. Todos los derechos reservados.</p>
        <p style={{ color: '#475569', fontSize: '12px', marginTop: 10 }}>Hecho para emprendedores.</p>
      </footer>

      {/* --- BOTÓN FLOTANTE DE WHATSAPP --- */}
      <a 
        href="https://wa.me/5492324694045" // ⚠️ CAMBIA ESTO POR TU NÚMERO REAL
        target="_blank" 
        rel="noopener noreferrer"
        className="hover-card"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: '#25D366',
          color: 'white',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30px',
          boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
          zIndex: 1000,
          textDecoration: 'none',
          cursor: 'pointer'
        }}
      >
        💬
      </a>
    </div>
  );
}