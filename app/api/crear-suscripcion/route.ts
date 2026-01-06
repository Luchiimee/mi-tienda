import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

// Usamos process.env para que tome la clave de Vercel (seguro)
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!, 
  options: { timeout: 5000 } 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body; 

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
        // IMPORTANTE: Esto tomará la URL real de Vercel automáticamente
        back_url: `${process.env.NEXT_PUBLIC_BASE_URL}/configuracion`,
        payer_email: email || 'test_user_999@testuser.com',
        status: 'pending'
      }
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("❌ ERROR MERCADO PAGO:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}