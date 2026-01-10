import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
  try {
    // 1. Validar que las claves existan ANTES de usarlas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Faltan las credenciales de Supabase (URL o SERVICE_KEY) en Vercel.");
    }

    // 2. Inicializar Supabase Admin AQUÍ ADENTRO (Para evitar error de Build)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, plan, shopId, couponCode } = await req.json();

    // 3. PRECIO BASE
    let finalPrice = plan === 'full' ? 20100 : 15200;
    let description = `Suscripción Snappy - Plan ${plan === 'full' ? 'Full' : 'Básico'}`;

    // 4. VERIFICAR CUPÓN
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

    finalPrice = Math.round(finalPrice);

    // 5. Crear PreApproval en Mercado Pago
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
        back_url: `${process.env.NEXT_PUBLIC_DOMAIN_URL}/configuracion`, 
        payer_email: email,
        external_reference: shopId, 
        status: 'pending',
      }
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("Error creando suscripción:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}