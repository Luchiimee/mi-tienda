'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: '#ffffff', width: '100%', overflowX: 'hidden' }}>
     {/* --- NAVBAR --- */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ fontSize: '24px', fontWeight: '800', color: '#2c3e50', display:'flex', alignItems:'center', gap:10 }}>
           {/* Icono de Rayo para Snappy */}
           <div style={{background: 'linear-gradient(135deg, #f1c40f, #f39c12)', color:'white', width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>⚡</div>
           Snappy
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems:'center' }}>
          {/* AHORA APUNTAN A /auth */}
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
           <span style={{background:'#e3f2fd', color:'#3498db', padding:'5px 15px', borderRadius:20, fontSize:12, fontWeight:'bold', letterSpacing:1}}>POTENCIA TU NEGOCIO</span>
           
           <h1 style={{ fontSize: 'clamp(40px, 5vw, 60px)', lineHeight: '1.1', margin: '20px 0', color: '#1a252f', fontWeight:900 }}>
             Crea tu <span style={{color:'#3498db'}}>Tienda Digital</span> <br/>
             en minutos.
           </h1>
           
           <p style={{ fontSize: '18px', color: '#7f8c8d', lineHeight: '1.6', marginBottom: '30px', maxWidth:'500px' }}>
             La plataforma todo en uno para emprendedores. Elige una plantilla, carga tus productos y recibe pedidos por WhatsApp. Sin comisiones.
           </p>
           
           <div style={{display:'flex', gap:15, flexWrap:'wrap'}}>
              <Link href="/login">
                <button style={{ padding: '15px 40px', fontSize: '16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold', boxShadow:'0 10px 20px rgba(52, 152, 219, 0.3)' }}>
                  Comenzar Gratis
                </button>
              </Link>
           </div>
           
           <div style={{marginTop:30, display:'flex', gap:20, fontSize:12, color:'#999'}}>
               <span>✓ Sin tarjeta de crédito</span>
               <span>✓ Setup instantáneo</span>
           </div>
        </div>

        {/* --- CELULAR PROGRAMADO --- */}
        <div style={{ display:'flex', justifyContent:'center', position:'relative', paddingBottom: 50 }}>
           
           <div style={{position:'absolute', width:'100%', height:'100%', background:'radial-gradient(circle, rgba(52,152,219,0.15) 0%, rgba(255,255,255,0) 70%)', top:'50%', left:'50%', transform:'translate(-50%, -50%)', zIndex:0}}></div>
           
           <div style={{
               width: 320, height: 650, background: 'white', borderRadius: 45, border: '12px solid #2c3e50',
               position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow:'hidden',
               display: 'flex', flexDirection: 'column'
           }}>
               <div style={{position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:120, height:25, background:'#2c3e50', borderBottomLeftRadius:18, borderBottomRightRadius:18, zIndex:10}}></div>

               <div style={{flex:1, overflowY:'auto', padding:'40px 15px 20px 15px', fontFamily:'sans-serif', scrollbarWidth:'none'}}>
                   
                   {/* Header Tienda Mockup */}
                   <div style={{textAlign:'center', marginBottom:20}}>
                       
                       {/* LOGO: Asegurate que el archivo sea tienda-logo.jpg */}
                       <div style={{
                           width:70, height:70, background:'#eee', borderRadius:'50%', margin:'0 auto 10px', 
                           overflow: 'hidden', border:'1px solid #ddd'
                       }}>
                          <img src="/tienda-logo.jpg" alt="Logo" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                       </div>

                       <h3 style={{margin:0, color:'#333', fontSize:18}}>Urban Style 🔥</h3>
                       <p style={{margin:'5px 0 0 0', color:'#888', fontSize:12}}>La mejor moda urbana al mejor precio.</p>
                   </div>

                   {/* BUSCADOR */}
                   <div style={{background:'#f5f5f5', padding:'10px 15px', borderRadius:8, color:'#999', fontSize:13, marginBottom:20, border:'1px solid #eee'}}>
                       🔍 Buscar productos...
                   </div>

                   {/* Grid Ropa */}
                   <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                       {/* Producto 1 */}
                       <div style={{border:'1px solid #eee', borderRadius:8, overflow:'hidden', paddingBottom:10}}>
                           <div style={{height:160, background:'#f0f0f0'}}>
                                <img src="/ropa1.jpg" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Ropa" />
                           </div>
                           <div style={{padding:'8px 8px 0 8px'}}>
                               <div style={{fontSize:13, fontWeight:'bold', color:'#333', marginBottom:4}}>Remera Oversize</div>
                               <div style={{fontSize:14, color:'#27ae60', fontWeight:'bold'}}>$18.500</div>
                               <button style={{width:'100%', marginTop:8, background:'#333', color:'white', border:'none', borderRadius:4, padding:'6px', fontSize:11}}>Agregar</button>
                           </div>
                       </div>
                       {/* Producto 2 */}
                       <div style={{border:'1px solid #eee', borderRadius:8, overflow:'hidden', paddingBottom:10}}>
                           <div style={{height:160, background:'#f0f0f0'}}>
                                <img src="/ropa2.jpg" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Ropa" />
                           </div>
                           <div style={{padding:'8px 8px 0 8px'}}>
                               <div style={{fontSize:13, fontWeight:'bold', color:'#333', marginBottom:4}}>Jean Mom Fit</div>
                               <div style={{fontSize:14, color:'#27ae60', fontWeight:'bold'}}>$42.000</div>
                               <button style={{width:'100%', marginTop:8, background:'#333', color:'white', border:'none', borderRadius:4, padding:'6px', fontSize:11}}>Agregar</button>
                           </div>
                       </div>
                        {/* Producto 3 */}
                       <div style={{border:'1px solid #eee', borderRadius:8, overflow:'hidden', paddingBottom:10}}>
                           <div style={{height:160, background:'#f0f0f0'}}>
                                <img src="/ropa3.jpg" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Ropa" />
                           </div>
                           <div style={{padding:'8px 8px 0 8px'}}>
                               <div style={{fontSize:13, fontWeight:'bold', color:'#333', marginBottom:4}}>Campera Puffer</div>
                               <div style={{fontSize:14, color:'#27ae60', fontWeight:'bold'}}>$65.000</div>
                               <button style={{width:'100%', marginTop:8, background:'#333', color:'white', border:'none', borderRadius:4, padding:'6px', fontSize:11}}>Agregar</button>
                           </div>
                       </div>
                        {/* Producto 4 */}
                       <div style={{border:'1px solid #eee', borderRadius:8, overflow:'hidden', paddingBottom:10}}>
                           <div style={{height:160, background:'#f0f0f0'}}>
                                <img src="/ropa4.jpg" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Ropa" />
                           </div>
                           <div style={{padding:'8px 8px 0 8px'}}>
                               <div style={{fontSize:13, fontWeight:'bold', color:'#333', marginBottom:4}}>Zapatillas Urban</div>
                               <div style={{fontSize:14, color:'#27ae60', fontWeight:'bold'}}>$55.000</div>
                               <button style={{width:'100%', marginTop:8, background:'#333', color:'white', border:'none', borderRadius:4, padding:'6px', fontSize:11}}>Agregar</button>
                           </div>
                       </div>
                   </div>

                   {/* --- FOOTER DEL CELULAR (NUEVO) --- */}
                   <div style={{marginTop:30, textAlign:'center', paddingTop:20, borderTop:'1px solid #eee'}}>
                       <p style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', margin: '15px 0 0 0', textTransform:'uppercase', letterSpacing:1 }}>
      Hecha con Snappy 🚀
   </p>
                   </div>
                   {/* ---------------------------------- */}

               </div>
               <div style={{position:'absolute', bottom:5, left:'50%', transform:'translateX(-50%)', width:100, height:4, background:'#ddd', borderRadius:5}}></div>
           </div>
        </div>
      </header>
{/* --- SECCIÓN DE PLANTILLAS --- */}
      <section style={{ padding: '80px 20px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ background: '#f1f5f9', color: '#3498db', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Diseños Reales</span>
            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#2c3e50', marginTop: '15px' }}>Una solución para cada negocio</h2>
            <p style={{ color: '#7f8c8d', fontSize: '18px', maxWidth: '600px', margin: '15px auto 0' }}>Elige la estructura que mejor se adapte a lo que vendes.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', alignItems: 'stretch' }}>
            
            {/* 1. TIENDA ONLINE */}
            <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '30px 20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
               <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>🛍️ Tienda</h3>
               {/* MOCKUP CONTAINER CON HOVER */}
               <div className="zoom-container" >
                  <img src="/plantilla-tienda.png" alt="Tienda Mockup" style={{width:'100%', height:'100%', objectFit:'cover', aspectRatio: '9/16', display: 'block'}} />
               </div>
               <p style={{ fontSize: '13px', color: '#64748b', marginTop: '15px', textAlign:'center' }}>Ideal para e-commerce clásico.</p>
            </div>

            {/* 2. CATÁLOGO */}
            <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '30px 20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
               <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>📒 Catálogo</h3>
               <div className="zoom-container">
                  <img src="/plantilla-catalogo.png" alt="Catalogo Mockup" style={{width:'100%', height:'100%', objectFit:'cover', aspectRatio: '9/16', display: 'block'}} />
               </div>
               <p style={{ fontSize: '13px', color: '#64748b', marginTop: '15px', textAlign:'center' }}>Para mostrar servicios o productos.</p>
            </div>

            {/* 3. MENÚ */}
            <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '30px 20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
               <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>🍔 Menú</h3>
               <div className="zoom-container">
                  <img src="/plantilla-menu.png" alt="Menu Mockup" style={{width:'100%', height:'100%', objectFit:'cover', aspectRatio: '9/16', display: 'block'}} />
               </div>
               <p style={{ fontSize: '13px', color: '#64748b', marginTop: '15px', textAlign:'center' }}>Gastronomía y delivery.</p>
            </div>

            {/* 4. PERSONAL */}
            <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '30px 20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
               <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>🪪 Personal</h3>
               <div className="zoom-container">
                  <img src="/plantilla-personal.png" alt="Personal Mockup" style={{width:'100%', height:'100%', objectFit:'cover', aspectRatio: '9/16', display: 'block'}} />
               </div>
               <p style={{ fontSize: '13px', color: '#64748b', marginTop: '15px', textAlign:'center' }}>Bio link y portafolio.</p>
            </div>

          </div>
        </div>
      </section>
      {/* --- SECCIÓN FLUJO DE COMPRA (CLIENTE) --- */}
      <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#2c3e50', marginBottom: '60px' }}>Así de fácil compran tus clientes</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            
            {/* PASO 1 */}
            <div style={{ background: 'white', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
               <div style={{ width: 80, height: 80, background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '35px', margin: '0 auto 20px' }}>👀</div>
               <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '15px' }}>1. Ven tu catálogo</h3>
               <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>Ingresan a tu link desde Instagram o redes. Ven tus fotos y precios actualizados al instante.</p>
            </div>

            {/* PASO 2 */}
            <div style={{ background: 'white', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
               <div style={{ width: 80, height: 80, background: '#fef9c3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '35px', margin: '0 auto 20px' }}>🛒</div>
               <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '15px' }}>2. Llenan el carrito</h3>
               <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>Eligen productos, talles o gustos y los suman al carrito. Sin registros molestos.</p>
            </div>

            {/* PASO 3 */}
            <div style={{ background: 'white', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '2px solid #22c55e', position: 'relative' }}>
               <div style={{ position: 'absolute', top: -15, right: 20, background: '#22c55e', color: 'white', padding: '5px 15px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' }}>¡SIN COMISIÓN!</div>
               <div style={{ width: 80, height: 80, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '35px', margin: '0 auto 20px' }}>📲</div>
               <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '15px' }}>3. Te llega a WhatsApp</h3>
               <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>El cliente toca "Enviar" y recibes el detalle completo en tu chat para coordinar el pago y envío.</p>
            </div>

          </div>
        </div>
      </section>
      {/* --- SECCIÓN CÓMO FUNCIONA --- */}
      <section style={{ padding: '80px 5%', background: '#f8fbff' }}>
          <div style={{maxWidth:1200, margin:'0 auto', textAlign:'center'}}>
              <h2 style={{fontSize:30, color:'#2c3e50', marginBottom:50}}>Lanza tu negocio en 3 pasos</h2>
              
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:40}}>
                  <div style={{background:'white', padding:30, borderRadius:15, boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
                      <div style={{fontSize:40, marginBottom:15}}>🎨</div>
                      <h3 style={{marginBottom:10, color:'#2c3e50'}}>1. Elige tu estilo</h3>
                      <p style={{color:'#7f8c8d', fontSize:14}}>Selecciona una plantilla y personaliza los colores.</p>
                  </div>
                  <div style={{background:'white', padding:30, borderRadius:15, boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
                      <div style={{fontSize:40, marginBottom:15}}>📦</div>
                      <h3 style={{marginBottom:10, color:'#2c3e50'}}>2. Carga productos</h3>
                      <p style={{color:'#7f8c8d', fontSize:14}}>Sube fotos, precios y descripciones desde nuestro panel.</p>
                  </div>
                  <div style={{background:'white', padding:30, borderRadius:15, boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
                      <div style={{fontSize:40, marginBottom:15}}>🔗</div>
                      <h3 style={{marginBottom:10, color:'#2c3e50'}}>3. Comparte y Vende</h3>
                      <p style={{color:'#7f8c8d', fontSize:14}}>Envía tu link único y recibe pedidos por WhatsApp.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- SECCIÓN PLANTILLAS --- */}
      <section style={{ padding: '80px 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{color:'#3498db', fontWeight:'bold', fontSize:12, letterSpacing:1}}>SOLUCIONES A MEDIDA</span>
            <h2 style={{ fontSize: '35px', color: '#2c3e50', marginTop:10 }}>Todo lo que necesitas</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            
            <div style={{ padding: 30, borderRadius: 20, border: '1px solid #eee', transition: '0.3s', position:'relative', overflow:'hidden' }}>
                <div style={{position:'absolute', top:0, right:0, background:'#e1f5fe', color:'#0288d1', padding:'5px 15px', borderBottomLeftRadius:15, fontSize:11, fontWeight:'bold'}}>POPULAR</div>
                <div style={{ fontSize: 40, marginBottom: 15 }}>🛒</div>
                <h3 style={{ margin: '0 0 10px 0', color:'#2c3e50' }}>Tienda Online</h3>
                <p style={{ fontSize: 14, color: '#7f8c8d', lineHeight: '1.5' }}>Carrito de compras inteligente. Ideal para ropa y accesorios.</p>
            </div>

            <div style={{ padding: 30, borderRadius: 20, border: '1px solid #eee' }}>
                <div style={{ fontSize: 40, marginBottom: 15 }}>🍔</div>
                <h3 style={{ margin: '0 0 10px 0', color:'#2c3e50' }}>Menú Digital</h3>
                <p style={{ fontSize: 14, color: '#7f8c8d', lineHeight: '1.5' }}>Experiencia tipo App de delivery. Perfecto para gastronomía.</p>
            </div>

            <div style={{ padding: 30, borderRadius: 20, border: '1px solid #eee' }}>
                <div style={{ fontSize: 40, marginBottom: 15 }}>📖</div>
                <h3 style={{ margin: '0 0 10px 0', color:'#2c3e50' }}>Catálogo Mayorista</h3>
                <p style={{ fontSize: 14, color: '#7f8c8d', lineHeight: '1.5' }}>Selección de múltiples productos para consultar stock.</p>
            </div>

            <div style={{ padding: 30, borderRadius: 20, border: '1px solid #eee' }}>
                <div style={{ fontSize: 40, marginBottom: 15 }}>👤</div>
                <h3 style={{ margin: '0 0 10px 0', color:'#2c3e50' }}>Bio Link</h3>
                <p style={{ fontSize: 14, color: '#7f8c8d', lineHeight: '1.5' }}>Unifica tus redes y contacto en un solo link profesional.</p>
            </div>

        </div>
      </section>
{/* --- SECCIÓN PREGUNTAS FRECUENTES (FAQ) --- */}
      <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', color: '#2c3e50', marginBottom: '50px' }}>Preguntas Frecuentes</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Pregunta 1 */}
            <details style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <summary style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '18px', listStyle: 'none' }}>🤔 ¿Cobran comisión por venta?</summary>
              <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>
                ¡No! Snappy no cobra ninguna comisión por tus ventas. Todo lo que vendes es 100% tuyo. Solo pagas la suscripción mensual del servicio.
              </p>
            </details>

            {/* Pregunta 2 */}
            <details style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <summary style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '18px' }}>💳 ¿Necesito tarjeta de crédito para probar?</summary>
              <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>
                No. Puedes crear tu cuenta y usar el periodo de prueba gratis sin ingresar ninguna tarjeta. Solo pagas si decides continuar.
              </p>
            </details>

            {/* Pregunta 3 */}
            <details style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <summary style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '18px' }}>🚀 ¿Puedo usar mi propio dominio?</summary>
              <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>
                Por el momento te damos un link corto y profesional (snappy.uno/tu-marca) listo para usar en Instagram y redes.
              </p>
            </details>

            {/* Pregunta 4 (AYUDA / WHATSAPP) */}
            <div style={{ background: '#ecfdf5', padding: '25px', borderRadius: '12px', border: '1px solid #10b981', textAlign: 'center', marginTop: '20px' }}>
              <h3 style={{ color: '#047857', fontSize: '20px', margin: '0 0 10px 0' }}>¿Necesitas ayuda para configurar tu tienda?</h3>
              <p style={{ color: '#065f46', marginBottom: '15px' }}>Si tienes dudas o no sabes por dónde empezar, habla con nosotros.</p>
              <a 
                href="https://wa.me/5492324694045" // ⚠️ REEMPLAZA CON TU NÚMERO
                target="_blank"
                style={{ display: 'inline-block', background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)' }}
              >
                📲 Escribir a Soporte por WhatsApp
              </a>
            </div>

          </div>
        </div>
      </section>
      {/* --- CTA FINAL --- */}
      <section style={{ padding: '80px 20px', textAlign: 'center', background: '#2c3e50', color: 'white' }}>
          <h2 style={{fontSize:35, marginBottom:20}}>Empieza tu negocio hoy</h2>
          <Link href="/admin">
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
          <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Login</Link>
        </div>
        <p style={{ color: '#475569', fontSize: '14px' }}>© {new Date().getFullYear()} Snappy Inc. Todos los derechos reservados.</p>
        <p style={{ color: '#475569', fontSize: '12px', marginTop: 10 }}>Hecho para emprendedores.</p>
      </footer>
{/* --- BOTÓN FLOTANTE DE WHATSAPP --- */}
      <a 
        href="https://wa.me/5492324694045" // ⚠️ CAMBIA ESTO POR TU NÚMERO REAL (Ej: 54911...)
        target="_blank" 
        rel="noopener noreferrer"
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
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        💬
      </a>
    </div>
  );
}