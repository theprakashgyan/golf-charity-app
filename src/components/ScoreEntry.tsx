'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ScoreEntry({ userId }: { userId: string }) {
    const [score, setScore] = useState('')
    const [date, setDate] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 1. Validation: Score must be 1-45 [cite: 45]
        const scoreVal = parseInt(score)
        if (scoreVal < 1 || scoreVal > 45) {
            alert("Score must be between 1 and 45")
            return
        }

        // 2. Insert the new score [cite: 46]
        const { error } = await supabase
            .from('scores')
            .insert([{ user_id: userId, score: scoreVal, date_played: date }])

        if (error) console.error(error)
        else alert("Score added!")
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-zinc-900 rounded-lg space-y-4">
            <input
                type="number"
                placeholder="Score (1-45)"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full bg-black border border-zinc-700 p-2 rounded"
            />
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black border border-zinc-700 p-2 rounded"
            />
            <button type="submit" className="w-full bg-blue-600 py-2 rounded font-bold">
                Submit Score
            </button>
        </form>
    )
}