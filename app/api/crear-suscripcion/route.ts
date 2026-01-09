import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago'; // ⚠️ CAMBIO: Usamos PreApproval (Suscripciones)

// Configuración del cliente con tu Token
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!, 
  options: { timeout: 10000 } 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, plan, shopId, price } = body;

    // Inicializamos la clase de Suscripciones
    const subscription = new PreApproval(client);

    // Creamos la suscripción recurrente
    const result = await subscription.create({
      body: {
        reason: plan === 'full' ? 'Suscripción Plan Full - Snappy' : 'Suscripción Plan Simple - Snappy',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months', // 🗓️ COBRO MENSUAL AUTOMÁTICO
          transaction_amount: price, // El precio que viene del frontend (5000 o 9000)
          currency_id: 'ARS', // Moneda Argentina
        },
        // URL dinámica: funciona en localhost y en snappy.uno
        back_url: `${process.env.NEXT_PUBLIC_BASE_URL}/configuracion?status=success`,
        payer_email: email, // El email del usuario para asociar la tarjeta
        external_reference: shopId, // Guardamos el ID de tu tienda para saber quién pagó
        status: 'pending',
      }
    });

    console.log("✅ Suscripción generada:", result.init_point);
    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("❌ ERROR MERCADO PAGO:", error);
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}