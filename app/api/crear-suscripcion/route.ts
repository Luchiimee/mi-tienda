import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago'; // ⚠️ Fíjate que importamos Preference

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!, 
  options: { timeout: 5000 } 
});

export async function POST(request: Request) {
  try {
    // Usamos Preference (Checkout estándar) en lugar de PreApproval.
    // Esto es mucho más robusto y NO da error 500 por emails.
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: 'plan-full-mensual',
            title: 'Suscripción Plan Full (30 días)', // El título que verá el usuario
            quantity: 1,
            unit_price: 5000 // Precio
          }
        ],
        // Configuración de redirección (A donde vuelve el usuario)
        back_urls: {
          success: 'https://mi-tienda-kappa.vercel.app/configuracion',
          failure: 'https://mi-tienda-kappa.vercel.app/configuracion',
          pending: 'https://mi-tienda-kappa.vercel.app/configuracion'
        },
        auto_return: 'approved',
      }
    });

    console.log("✅ Link generado:", result.init_point);
    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("❌ ERROR MERCADO PAGO:", error);
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}