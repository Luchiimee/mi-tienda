import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

// Inicializar Supabase Admin (para leer cupones de forma segura)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '' // ⚠️ Asegúrate de tener esta key en .env.local
);

export async function POST(req: Request) {
  try {
    const { email, plan, shopId, couponCode } = await req.json();

    // 1. PRECIO BASE
    let finalPrice = plan === 'full' ? 20100 : 15200;
    let description = `Suscripción Snappy - Plan ${plan === 'full' ? 'Full' : 'Básico'}`;

    // 2. VERIFICAR CUPÓN (Si enviaron uno)
    if (couponCode) {
        const { data: coupon } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase())
            .eq('active', true)
            .single();

        if (coupon) {
            const discountAmount = finalPrice * (coupon.discount_percent / 100);
            finalPrice = finalPrice - discountAmount;
            description += ` (Cupón ${couponCode} aplicado: ${coupon.discount_percent}% OFF)`;
        }
    }

    // Aseguramos que el precio sea entero (Mercado Pago a veces molesta con decimales)
    finalPrice = Math.round(finalPrice);

    // 3. Crear PreApproval en Mercado Pago
    const preapproval = new PreApproval(client);
    
    const result = await preapproval.create({
      body: {
        reason: description,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: finalPrice,
          currency_id: 'ARS',
        },
        back_url: `${process.env.NEXT_PUBLIC_DOMAIN_URL}/configuracion`, // Redirige aquí al terminar
        payer_email: email,
        external_reference: shopId, // Vinculamos el pago a la tienda
        status: 'pending',
      }
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("Error creando suscripción:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}