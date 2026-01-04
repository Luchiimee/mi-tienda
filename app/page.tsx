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
              <Link href="/admin">
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
                       <p style={{fontSize:11, color:'#aaa', margin:0}}>Sitio creado con</p>
                       <p style={{fontSize:12, fontWeight:'bold', color:'#2c3e50', margin:'2px 0 0 0'}}>MyPlatform 🚀</p>
                   </div>
                   {/* ---------------------------------- */}

               </div>
               <div style={{position:'absolute', bottom:5, left:'50%', transform:'translateX(-50%)', width:100, height:4, background:'#ddd', borderRadius:5}}></div>
           </div>
        </div>
      </header>

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
      <footer style={{ background: '#1a252f', color: '#7f8c8d', padding: '50px 5%', fontSize:14 }}>
          <div style={{maxWidth:1200, margin:'0 auto', textAlign:'center'}}>
             <p>© 2024 MyPlatform. Hecho para emprendedores.</p>
          </div>
      </footer>
    </div>
  );
}