import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          Feature Request Voting System
        </h1>
        <div className="flex flex-col items-center gap-4">
          <Link href="/login" className="btn-primary">
            Login
          </Link>
          <Link href="/register" className="btn-secondary">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
