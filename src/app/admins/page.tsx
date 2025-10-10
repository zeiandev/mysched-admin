import { getFlags } from "@/lib/edge-config";

export default async function AdminsPage() {
  const { import_enabled, beta_ui } = await getFlags();

  if (!import_enabled) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <p className="mt-4 text-gray-500">Import feature is OFF</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <p className="mt-4 text-green-600">Import feature is ON</p>
      {beta_ui ? <div className="mt-6">Beta UI enabled</div> : null}
    </main>
  );
}
