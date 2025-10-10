export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 px-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
        <a
          href="/dashboard"
          className="inline-block rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#0A2B52] hover:bg-gray-50 transition"
        >
          ← Back to Dashboard
        </a>
      </div>
    </main>
  );
}
