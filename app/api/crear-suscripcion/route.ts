import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

export async function POST(req: Request) {
  try {
    // 1. Validar que el token existe antes de empezar
    if (!process.env.MP_ACCESS_TOKEN) {
      throw new Error("Falta configurar MP_ACCESS_TOKEN en .env.local");
    }

    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN 
    });

    const body = await req.json();
    const { email, plan, shopId, price } = body;

    console.log("⏳ Generando suscripción para:", email, "Plan:", plan, "Precio:", price);

    const subscription = new PreApproval(client);

    const result = await subscription.create({
      body: {
        reason: plan === 'full' ? 'Suscripción Plan Full - Snappy' : 'Suscripción Plan Simple - Snappy',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: price,
          currency_id: 'ARS',
        },
        // Usamos una URL por defecto si no está configurada la variable, para evitar crash
        back_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://snappy.uno'}/configuracion?status=success`,
        payer_email: email,
        external_reference: shopId,
        status: 'pending',
      }
    });

    console.log("✅ Suscripción creada exitosamente:", result.init_point);
    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO MERCADO PAGO:", error);
    // Devolvemos el error como JSON para que el frontend no se rompa con "Unexpected end of JSON"
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}