import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any, // Use standard API version formatting
})

export async function POST(req: Request) {
    try {
        const { priceId, userId } = await req.json()

        // Create a secure checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            // Where to send them after they pay (or if they back out)
            success_url: `http://localhost:3000/dashboard?success=true`,
            cancel_url: `http://localhost:3000/dashboard?canceled=true`,
            metadata: {
                userId: userId, // We attach their ID so we know WHO paid later!
            },
        })

        // Return the secure Stripe URL to the frontend
        return NextResponse.json({ url: session.url })
    } catch (error: any) {
        console.error("Stripe Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}