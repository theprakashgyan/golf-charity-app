'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboard() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isDrawing, setIsDrawing] = useState(false)
    const [lastDraw, setLastDraw] = useState<number[]>([])
    const router = useRouter()

    useEffect(() => {
        const checkAdminStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            // IMPORTANT: Change this to your actual login email!
            if (!user || user.email !== 'your-email@example.com') {
                router.push('/dashboard')
                return
            }
            setIsAdmin(true)
            setLoading(false)
        }
        checkAdminStatus()
    }, [router])

    // --- THE DRAW ENGINE ALGORITHM ---
    const executeDrawSimulation = async () => {
        setIsDrawing(true)

        // 1. Generate 5 unique random numbers between 1 and 45
        const drawnNumbers = new Set<number>()
        while (drawnNumbers.size < 5) {
            drawnNumbers.add(Math.floor(Math.random() * 45) + 1)
        }

        // Convert Set to Array and sort them for easy reading
        const winningNumbers = Array.from(drawnNumbers).sort((a, b) => a - b)

        // 2. Save the simulation to the database
        const { error } = await supabase
            .from('draws')
            .insert([{
                winning_numbers: winningNumbers,
                status: 'simulation'
            }])

        if (error) {
            console.error("Draw failed:", error)
            alert("Failed to run the draw. Check console.")
        } else {
            setLastDraw(winningNumbers)
        }

        setIsDrawing(false)
    }

    if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading Admin...</div>
    if (!isAdmin) return null

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-blue-500">Admin Control Center</h1>
                    <p className="text-zinc-400">Manage draws, verify winners, and track metrics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Draw Engine Module */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        <h2 className="text-xl font-bold mb-4">Run Monthly Draw</h2>

                        {lastDraw.length > 0 && (
                            <div className="mb-6 bg-black p-4 rounded border border-zinc-800 text-center">
                                <p className="text-sm text-zinc-400 mb-2">Simulation Results:</p>
                                <div className="flex justify-center gap-3">
                                    {lastDraw.map((num, i) => (
                                        <span key={i} className="bg-blue-600 text-white font-bold h-10 w-10 flex items-center justify-center rounded-full">
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={executeDrawSimulation}
                            disabled={isDrawing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors disabled:opacity-50"
                        >
                            {isDrawing ? 'Calculating...' : 'Execute Draw Simulation'}
                        </button>
                    </div>

                    {/* System Metrics */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        <h2 className="text-xl font-bold mb-4">System Metrics</h2>
                        <ul className="space-y-4">
                            <li className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-400">Total Active Subscriptions</span>
                                <span className="font-bold">--</span>
                            </li>
                            <li className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-400">Current Prize Pool</span>
                                <span className="font-bold text-green-400">$ --</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    )
}