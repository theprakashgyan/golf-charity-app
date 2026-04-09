'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (isSignUp) {
            // Handle Sign Up
            const { error } = await supabase.auth.signUp({ email, password })
            if (error) setError(error.message)
            else {
                alert("Account created! Logging you in...")
                router.push('/dashboard')
            }
        } else {
            // Handle Login
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) setError(error.message)
            else router.push('/dashboard')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl border border-zinc-800">
                <h1 className="text-3xl font-extrabold text-white mb-2 text-center">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-zinc-400 text-center mb-6">
                    {isSignUp ? 'Join the impact today.' : 'Enter your details to sign in.'}
                </p>

                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-zinc-400 text-sm font-bold mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-zinc-700 text-white p-3 rounded focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-400 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-zinc-700 text-white p-3 rounded focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors">
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-zinc-400 hover:text-white transition-colors text-sm"
                    >
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                </div>
            </div>
        </div>
    )
}