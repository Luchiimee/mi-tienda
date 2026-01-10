import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: "No se encontró ID de suscripción" }, { status: 400 });
    }

    const preapproval = new PreApproval(client);

    // Actualizamos el estado a 'cancelled'
    await preapproval.update({
      id: subscriptionId,
      body: { status: 'cancelled' }
    });

    return NextResponse.json({ message: "Suscripción cancelada correctamente" });

  } catch (error: any) {
    console.error("Error cancelando suscripción:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}