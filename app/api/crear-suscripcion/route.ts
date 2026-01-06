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
        back_url: 'https://mi-tienda-kappa.vercel.app/configuracion',
        
        // 👇 PEGA AQUÍ EL EMAIL QUE ACABAS DE CREAR EN EL PANEL (NO inventes uno)
        payer_email: 'TESTUSER2557599897225491145git', 
        
        status: 'pending'
      }
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("❌ ERROR MERCADO PAGO:", error);
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}