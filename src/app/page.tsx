import Link from 'next/link' // Add this at the very top

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-6">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Play with Purpose. <br /><span className="text-blue-500">Win with Impact.</span>
        </h1>
        <p className="text-lg text-zinc-400">
          Turn your golf scores into charitable donations and monthly prize draws. No fairways, just impact.
        </p>

        {/* Update this button to a Link */}
        <Link href="/login" className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-all inline-block">
          Subscribe & Play
        </Link>

      </div>
    </main>
  );
}