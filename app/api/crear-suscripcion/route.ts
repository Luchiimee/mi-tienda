import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

export async function POST(req: Request) {
  try {
    // 1. Diagnóstico de Token
    const token = process.env.MP_ACCESS_TOKEN;
    console.log("------------------------------------------------");
    console.log("🔍 INTENTO DE SUSCRIPCIÓN");
    
    if (!token) {
      console.error("❌ ERROR: No hay token MP configurado");
      return NextResponse.json(
        { error: "Falta configurar MP_ACCESS_TOKEN en el servidor." }, 
        { status: 500 }
      );
    }

    // 2. Configuración de Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: token });
    const subscription = new PreApproval(client);

    // 3. Leer datos del Frontend
    const body = await req.json();
    const { email, plan, shopId, price } = body;

    console.log(`🔍 Datos recibidos: Email: ${email}, Plan: ${plan}, Precio: ${price}`);

    // 4. Crear Suscripción (Preapproval)
    const result = await subscription.create({
      body: {
        reason: plan === 'full' ? 'Suscripción Plan Full - Snappy' : 'Suscripción Plan Simple - Snappy',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: Number(price), // Aseguramos que sea número
          currency_id: 'ARS',
        },
        // ⚠️ CAMBIO CLAVE: Usamos tu dominio real para evitar errores de variable de entorno
        back_url: 'https://snappy.uno/configuracion?status=success',
        payer_email: email,
        external_reference: shopId,
        status: 'pending',
      }
    });

    console.log("✅ Link generado:", result.init_point);
    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("❌ ERROR MERCADO PAGO:", error);
    return NextResponse.json(
      { error: error.message || "Error desconocido en MP" }, 
      { status: 500 }
    );
  }
}