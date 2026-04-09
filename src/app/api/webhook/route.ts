import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
})

// We need the special "Service Role" key to securely update the DB from the backend
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // We will add this to your .env file next!
)

export async function POST(req: Request) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature') as string
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    let event: Stripe.Event

    try {
        // 1. Verify the event actually came from Stripe
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // 2. Handle the successful payment
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId // We saved this during Step 15!

        if (userId) {
            // 3. Upgrade their database profile to "Active"
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ subscription_status: 'active' })
                .eq('id', userId)

            if (error) {
                console.error("Database update failed:", error)
                return NextResponse.json({ error: "Database update failed" }, { status: 500 })
            }

            console.log(`Success! User ${userId} is now Active.`)
        }
    }

    return NextResponse.json({ received: true })
}