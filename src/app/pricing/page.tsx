'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const router = useRouter()

    // REPLACE THESE WITH YOUR ACTUAL STRIPE PRICE IDs!
    const MONTHLY_PRICE_ID = 'prod_UIu2cAAzofgXDu'
    const YEARLY_PRICE_ID = 'prod_UIu3CoYayJrRhO'

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
            } else {
                setUserId(user.id)
            }
        }
        getUser()
    }, [router])

    const handleCheckout = async (priceId: string) => {
        setLoading(priceId)
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId, userId }),
            })
            const data = await response.json()

            if (data.url) {
                window.location.href = data.url // Send them to Stripe!
            } else {
                alert("Failed to start checkout. Check console.")
            }
        } catch (error) {
            console.error(error)
        }
        setLoading(null)
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-10 flex flex-col items-center justify-center">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold mb-4">Choose Your Impact</h1>
                <p className="text-zinc-400">Unlock your dashboard, log your scores, and support great causes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Monthly Plan */}
                <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 flex flex-col">
                    <h2 className="text-2xl font-bold mb-2">Monthly Member</h2>
                    <p className="text-4xl font-extrabold mb-6">$10 <span className="text-lg text-zinc-500 font-normal">/mo</span></p>
                    <ul className="space-y-3 mb-8 text-zinc-400 flex-grow">
                        <li>✓ Enter the monthly prize draw</li>
                        <li>✓ Support your chosen charity</li>
                        <li>✓ Full dashboard access</li>
                    </ul>
                    <button
                        onClick={() => handleCheckout(MONTHLY_PRICE_ID)}
                        disabled={loading !== null}
                        className="w-full bg-white text-black font-bold py-3 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        {loading === MONTHLY_PRICE_ID ? 'Processing...' : 'Subscribe Monthly'}
                    </button>
                </div>

                {/* Yearly Plan */}
                <div className="bg-gradient-to-b from-blue-900/40 to-zinc-900 p-8 rounded-xl border border-blue-500/50 flex flex-col">
                    <div className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-2">Best Value</div>
                    <h2 className="text-2xl font-bold mb-2">Annual Member</h2>
                    <p className="text-4xl font-extrabold mb-6">$100 <span className="text-lg text-zinc-500 font-normal">/yr</span></p>
                    <ul className="space-y-3 mb-8 text-zinc-400 flex-grow">
                        <li>✓ Everything in Monthly</li>
                        <li>✓ Save $20 a year</li>
                        <li>✓ Maximize charity impact</li>
                    </ul>
                    <button
                        onClick={() => handleCheckout(YEARLY_PRICE_ID)}
                        disabled={loading !== null}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading === YEARLY_PRICE_ID ? 'Processing...' : 'Subscribe Annually'}
                    </button>
                </div>
            </div>
        </div>
    )
}