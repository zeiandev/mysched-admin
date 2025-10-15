import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 font-sans">
      <h1 className="text-3xl font-bold">MySched</h1>
      <p className="text-gray-600">Choose a table to manage:</p>

      <Link
        href="/admin"
        className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Go to Dashboard
      </Link>

      <div className="grid gap-3 mt-6">
        <Link href="/admin/classes" className="px-4 py-2 border rounded hover:bg-gray-100">
          Classes
        </Link>
        <Link href="/admin/sections" className="px-4 py-2 border rounded hover:bg-gray-100">
          Sections
        </Link>
      </div>

      <div className="mt-10">
        <Link href="/login" className="underline text-blue-600">
          Admin Login
        </Link>
      </div>
    </main>
  );
}
