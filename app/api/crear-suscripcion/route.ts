import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!, 
  options: { timeout: 5000 } 
});

export async function POST(request: Request) {
  try {
    const preapproval = new PreApproval(client);

    // Generamos un email aleatorio para evitar error de usuario duplicado
    const emailRandom = `test_user_${Math.floor(Math.random() * 10000)}@testuser.com`;

    const result = await preapproval.create({
      body: {
        reason: "Suscripción Plan Full - Snappy",
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 5000,
          currency_id: 'ARS'
        }, // <--- AQUÍ SE CIERRA auto_recurring

        // Estas opciones van AFUERA de auto_recurring, pero DENTRO de body:
        back_url: 'https://mi-tienda-kappa.vercel.app/configuracion',
        payer_email: emailRandom,
        status: 'pending'
      }
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("❌ ERROR MERCADO PAGO:", error);
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}