'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation' // Add this to handle redirects
import { supabase } from '../../lib/supabaseClient'
import ScoreEntry from '../../components/ScoreEntry'

export default function UserDashboard() {
    const [scores, setScores] = useState<any[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const getUserAndScores = async () => {
            // 1. Get the current logged-in user
            const { data: { user } } = await supabase.auth.getUser()

            // 2. If no user is found, redirect them to login
            if (!user) {
                router.push('/login')
                return
            }

            // 3. If user exists, save their ID
            setUserId(user.id)

            // 4. Fetch THEIR specific scores
            const { data: scoreData } = await supabase
                .from('scores')
                .select('*')
                .eq('user_id', user.id)
                .order('date_played', { ascending: false })
                .limit(5)

            if (scoreData) setScores(scoreData)
            setLoading(false)
        }

        getUserAndScores()
    }, [router])

    // Show a simple loading state while checking auth
    if (loading) {
        return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>
    }

    // We need this check just in case it renders for a split second before redirecting
    if (!userId) return null;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Player Dashboard</h1>
                        <p className="text-zinc-400">Manage your scores and track your impact.</p>
                    </div>
                    {/* Add a quick Logout button */}
                    <button
                        onClick={() => { supabase.auth.signOut(); router.push('/'); }}
                        className="text-sm bg-zinc-800 px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        <h2 className="text-xl font-bold mb-4">Log a New Score</h2>
                        {/* Pass the REAL userId to your component */}
                        <ScoreEntry userId={userId} />
                    </div>

                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        <h2 className="text-xl font-bold mb-4">Your Recent Scores</h2>
                        {scores.length === 0 ? (
                            <p className="text-zinc-500">No scores logged yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {scores.map((score, index) => (
                                    <li key={index} className="flex justify-between items-center bg-black p-3 rounded border border-zinc-800">
                                        <span className="text-zinc-400">{score.date_played}</span>
                                        <span className="text-2xl font-bold text-blue-500">{score.score} pts</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}