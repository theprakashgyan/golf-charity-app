'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboard() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isDrawing, setIsDrawing] = useState(false)
    const [lastDraw, setLastDraw] = useState<number[]>([])

    // NEW: State to hold our winners
    const [winners, setWinners] = useState({ match5: [], match4: [], match3: [] })

    const router = useRouter()

    useEffect(() => {
        const checkAdminStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || user.email !== 'your-email@example.com') { // Keep your actual email here!
                router.push('/dashboard')
                return
            }
            setIsAdmin(true)
            setLoading(false)
        }
        checkAdminStatus()
    }, [router])

    const executeDrawSimulation = async () => {
        setIsDrawing(true)
        setWinners({ match5: [], match4: [], match3: [] }) // Reset winners

        // 1. Generate 5 unique random numbers
        const drawnNumbers = new Set<number>()
        while (drawnNumbers.size < 5) {
            drawnNumbers.add(Math.floor(Math.random() * 45) + 1)
        }
        const winningNumbers = Array.from(drawnNumbers).sort((a, b) => a - b)

        // 2. Save the simulation
        const { error } = await supabase
            .from('draws')
            .insert([{ winning_numbers: winningNumbers, status: 'simulation' }])

        if (error) {
            console.error("Draw failed:", error)
            alert("Failed to run the draw. Check console.")
            setIsDrawing(false)
            return
        }

        setLastDraw(winningNumbers)

        // --- THE MATCHING ALGORITHM ---

        // 3. Fetch ALL scores from the database
        const { data: allScores } = await supabase.from('scores').select('user_id, score')

        if (allScores) {
            // Group scores by user
            const userScores: Record<string, number[]> = {}
            allScores.forEach(row => {
                if (!userScores[row.user_id]) userScores[row.user_id] = []
                userScores[row.user_id].push(row.score)
            })

            // 4. Count matches for each user
            const currentWinners: any = { match5: [], match4: [], match3: [] }

            Object.keys(userScores).forEach(userId => {
                const userNums = userScores[userId]
                let matchCount = 0

                userNums.forEach(num => {
                    if (winningNumbers.includes(num)) matchCount++
                })

                // 5. Sort them into the prize tiers
                if (matchCount === 5) currentWinners.match5.push(userId)
                if (matchCount === 4) currentWinners.match4.push(userId)
                if (matchCount === 3) currentWinners.match3.push(userId)
            })

            setWinners(currentWinners)
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
                            {isDrawing ? 'Calculating Matches...' : 'Execute Draw Simulation'}
                        </button>
                    </div>

                    {/* NEW: Winner Results Display */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col">
                        <h2 className="text-xl font-bold mb-4">Simulation Winners</h2>

                        {lastDraw.length === 0 ? (
                            <p className="text-zinc-500 flex-grow flex items-center justify-center italic">Run a draw to see winners.</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-black p-3 rounded border border-zinc-800 flex justify-between items-center">
                                    <span className="font-bold text-yellow-400">5-Number Match (Jackpot)</span>
                                    <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm">{winners.match5.length} Winners</span>
                                </div>

                                <div className="bg-black p-3 rounded border border-zinc-800 flex justify-between items-center">
                                    <span className="font-bold text-zinc-200">4-Number Match</span>
                                    <span className="bg-zinc-700 text-white px-3 py-1 rounded-full text-sm">{winners.match4.length} Winners</span>
                                </div>

                                <div className="bg-black p-3 rounded border border-zinc-800 flex justify-between items-center">
                                    <span className="font-bold text-orange-400">3-Number Match</span>
                                    <span className="bg-orange-400/20 text-orange-400 px-3 py-1 rounded-full text-sm">{winners.match3.length} Winners</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}