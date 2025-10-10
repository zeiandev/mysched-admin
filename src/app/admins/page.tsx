import { getFlags } from "@/lib/edge-config";

export default async function AdminPage() {
  const flags = await getFlags();

  // Example feature toggle
  if (!flags.import_enabled) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <p className="mt-4 text-gray-500">Import feature is currently OFF</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <p className="mt-4 text-green-600">Import feature is ON</p>
      {/* your import UI or components go here */}
    </main>
  );
}
