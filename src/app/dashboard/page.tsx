'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import ScoreEntry from '../../components/ScoreEntry'
import Link from 'next/link'

export default function UserDashboard() {
    const [scores, setScores] = useState<any[]>([])
    const [profile, setProfile] = useState<any>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)

            // 1. Fetch Profile + Charity details in one go
            const { data: profileData } = await supabase
                .from('profiles')
                .select(`
          subscription_status, 
          charity_percentage,
          charities ( name )
        `)
                .eq('id', user.id)
                .single()

            if (profileData) setProfile(profileData)

            // 2. Fetch their Scores
            const { data: scoreData } = await supabase
                .from('scores')
                .select('*')
                .eq('user_id', user.id)
                .order('date_played', { ascending: false })
                .limit(5)

            if (scoreData) setScores(scoreData)

            setLoading(false)
        }

        getUserData()
    }, [router])

    if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading Dashboard...</div>
    if (!userId) return null;

    // Determine if they are eligible for the next draw
    const isEntered = scores.length === 5;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Player Dashboard</h1>
                        <p className="text-zinc-400">Track your performance and your impact.</p>
                    </div>
                    <button
                        onClick={() => { supabase.auth.signOut(); router.push('/'); }}
                        className="text-sm bg-zinc-800 px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Top Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Subscription Status */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        <p className="text-sm text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Plan Status</p>
                        <p className="text-2xl font-bold capitalize text-white mb-2">
                            {profile?.subscription_status || 'Inactive'}
                        </p>
                        {profile?.subscription_status !== 'active' && (
                            <Link href="/pricing" className="inline-block text-sm bg-blue-600 px-4 py-1 rounded-full hover:bg-blue-700 transition-colors">
                                Activate Plan
                            </Link>
                        )}
                    </div>

                    {/* Charity Impact */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        <p className="text-sm text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Your Cause</p>
                        <p className="text-xl font-bold text-white leading-tight mb-2">
                            {profile?.charities?.name || 'No charity selected'}
                        </p>
                        <p className="text-sm text-blue-400 font-semibold">
                            {profile?.charity_percentage || 0}% of your fee goes here
                        </p>
                    </div>

                    {/* Draw Participation */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col justify-center">
                        <p className="text-sm text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Next Draw Status</p>
                        {isEntered ? (
                            <div>
                                <p className="text-2xl font-bold text-green-400 mb-1">Entered</p>
                                <p className="text-sm text-zinc-400">Your 5 scores are locked in.</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-2xl font-bold text-yellow-500 mb-1">Action Needed</p>
                                <p className="text-sm text-zinc-400">Log {5 - scores.length} more scores to enter.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Score Management Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        <h2 className="text-xl font-bold mb-4">Log a New Score</h2>
                        <ScoreEntry userId={userId} />
                    </div>

                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col">
                        <h2 className="text-xl font-bold mb-4">Your Draw Numbers</h2>
                        {scores.length === 0 ? (
                            <p className="text-zinc-500 flex-grow flex items-center justify-center italic">No scores logged yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {scores.map((score, index) => (
                                    <li key={index} className="flex justify-between items-center bg-black p-3 rounded border border-zinc-800">
                                        <span className="text-zinc-400 text-sm">{score.date_played}</span>
                                        <span className="text-xl font-bold text-blue-500">{score.score}</span>
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