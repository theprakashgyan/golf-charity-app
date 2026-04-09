'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function CharityDirectory() {
    const [charities, setCharities] = useState<any[]>([])
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchCharities = async () => {
            const { data } = await supabase.from('charities').select('*')
            if (data) setCharities(data)
        }
        fetchCharities()
    }, [])

    const handleSelectCharity = async (charityId: string) => {
        setLoadingId(charityId)

        // 1. Get the current logged-in user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert("Please log in or sign up first!")
            router.push('/login')
            return
        }

        // 2. Save their choice to the 'profiles' table with the mandatory 10% minimum
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                charity_id: charityId,
                charity_percentage: 10
            })

        setLoadingId(null)

        if (error) {
            console.error(error)
            alert("Something went wrong saving your charity.")
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-10">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-extrabold mb-2">Choose Your Cause</h2>
                <p className="text-zinc-400 mb-10">A minimum of 10% of your subscription goes directly to your selected charity.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {charities.map(charity => (
                        <div key={charity.id} className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-blue-500 transition-all flex flex-col">
                            <h3 className="text-xl font-bold mb-2">{charity.name}</h3>
                            <p className="text-zinc-400 mb-6 flex-grow">{charity.description}</p>

                            <button
                                onClick={() => handleSelectCharity(charity.id)}
                                disabled={loadingId === charity.id}
                                className="w-full bg-white text-black hover:bg-zinc-200 py-3 rounded font-bold transition-colors disabled:opacity-50"
                            >
                                {loadingId === charity.id ? 'Saving...' : 'Support this Cause'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}