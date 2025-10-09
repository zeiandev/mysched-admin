export default function NotFound() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p>Check the URL or go back to /dashboard.</p>
      <a className="underline" href="/dashboard">Go to dashboard</a>
    </main>
  );
}
