import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

// Configuración inicial
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!, 
  options: { timeout: 5000 } 
});

export async function POST(request: Request) {
  try {
    const preapproval = new PreApproval(client);

    // Generamos un email aleatorio para que MP no se queje de "usuario duplicado"
    const emailRandom = `test_user_${Math.floor(Math.random() * 10000)}@testuser.com`;

    const result = await preapproval.create({
      body: {
        reason: "Suscripción Plan Full - Snappy",
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 5000,
          currency_id: 'ARS'
        },
        back_url: `${process.env.NEXT_PUBLIC_BASE_URL}/configuracion`,
        
        // AQUÍ ESTABA EL ERROR: Ahora forzamos un email válido siempre
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