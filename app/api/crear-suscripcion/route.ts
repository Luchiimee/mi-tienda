import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!, 
  options: { timeout: 5000 } 
});

export async function POST(request: Request) {
  try {
    const preapproval = new PreApproval(client);

    const result = await preapproval.create({
      body: {
        reason: "Suscripción Plan Full - Snappy",
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 5000,
          currency_id: 'ARS'
        },
        // Tu URL real de Vercel
        back_url: 'https://mi-tienda-kappa.vercel.app/configuracion',
        
        // 👇 AQUÍ ESTÁ EL EMAIL CORRECTO ARMADO CON TU ID DE LA FOTO
        payer_email: 'test_user_3116437723@testuser.com', 
        
        status: 'pending'
      }
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("❌ ERROR MERCADO PAGO:", error);
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}