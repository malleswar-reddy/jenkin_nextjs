import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-bold">Welcome to MyApp</h1>
        <p className="mt-3 text-lg">A small Next.js + Prisma + MySQL starter.</p>

        <div className="mt-6 flex gap-4">
          <Link
            href="/signup"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded border px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="rounded border px-4 py-2"
          >
            Dashboard
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Getting started</h2>
          <ol className="mt-2 list-decimal pl-6">
            <li>
              Start MySQL:{" "}
              <code>docker-compose up -d</code>
            </li>
            <li>Set up env and run Prisma migrate</li>
            <li>npm run dev</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
