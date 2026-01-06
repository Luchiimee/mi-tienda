import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!, 
  options: { timeout: 5000 } 
});

export async function POST(request: Request) {
  try {
    const preapproval = new PreApproval(client);

    // Creamos la suscripción SIN forzar el email del usuario.
    // Dejamos que Mercado Pago se encargue de pedirlo en el Checkout.
    const result = await preapproval.create({
      body: {
        reason: "Suscripción Plan Full - Snappy",
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 5000,
          currency_id: 'ARS'
        },
        back_url: 'https://mi-tienda-kappa.vercel.app/configuracion'
      }
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("❌ ERROR MERCADO PAGO:", error);
    // Si falla, devolvemos el mensaje exacto para ver si nos pide el email
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}