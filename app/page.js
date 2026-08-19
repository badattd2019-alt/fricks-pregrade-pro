'use client';
export default function Home() { ... }).
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(req) {
  try {
    const { title, price, certId, image } = await req.json();

    const origin = req.headers.get('origin') || 'https://fricks-pregrade-pro.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${title} (Certificate: ${certId})`,
              images: image && image.startsWith('http') ? [image] : [],
            },
            unit_amount: Math.round(Number(price) * 100), // Stripe expects amounts in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?success=true&cert=${certId}`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
