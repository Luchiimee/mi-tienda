import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
  try {
    // 1. Validaciones de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // DEFINIMOS EL DOMINIO AQUÍ PARA QUE NO FALLE
    // Si la variable de entorno falta, usa tu dominio real
    const domain = process.env.NEXT_PUBLIC_DOMAIN_URL || 'https://snappy.uno'; 

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Faltan credenciales de Supabase en el servidor.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { email, plan, shopId, couponCode } = await req.json();

    // 2. PRECIO BASE
    let finalPrice = plan === 'full' ? 20100 : 15200;
    let description = `Suscripción Snappy - Plan ${plan === 'full' ? 'Full' : 'Básico'}`;

    // 3. VERIFICAR CUPÓN
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

    // 4. Crear PreApproval (Suscripción)
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
        // AQUÍ USAMOS LA VARIABLE SEGURA 'domain'
        back_url: `${domain}/configuracion`, 
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